#!/usr/bin/env python3
"""Member 360: Publish a Version (Jonna, Nov 8, 2026). Run by .github/workflows/publish.yml; nobody uploads index.html.

  publish            makes the test copy live: takes the test-only parts out (tools/test_copy.py), runs Page Checks on
                     the result, saves it as releases/<version>.html and makes it index.html
  rollback VERSION   makes an earlier saved version live again, and resets the test copy to match it

releases/index.json lists every version ever made live (version, sha256, when, who, how) and the history of publishes
and rollbacks. Page Checks refuses an index.html that isn't one of them, so a hand upload of index.html is caught.
The live page as it stood before this was set up is saved too, so there is always something to roll back to.
Nothing in releases/ is ever deleted.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import test_copy  # noqa: E402

REL = os.path.join(ROOT, "releases")
IDX = os.path.join(REL, "index.json")
LIVE = os.path.join(ROOT, "index.html")
TEST = os.path.join(ROOT, "test", "index.html")
BUILD = os.path.join(ROOT, "build")
NOW = datetime.datetime.now(datetime.timezone.utc)
STAMP = NOW.strftime("%Y-%m-%dT%H:%M:%SZ")


def sha(s):
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def stop(msg):
    print("::error::" + msg)
    summary("Nothing changed: " + msg)
    sys.exit(1)


def summary(line):
    p = os.environ.get("GITHUB_STEP_SUMMARY")
    if p:
        with open(p, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    print(line)


def load():
    if os.path.exists(IDX):
        with open(IDX, encoding="utf-8") as f:
            return json.load(f)
    return {"live": "", "versions": [], "history": []}


def save(idx):
    os.makedirs(REL, exist_ok=True)
    with open(IDX, "w", encoding="utf-8") as f:
        json.dump(idx, f, indent=1, ensure_ascii=False)
        f.write("\n")


def new_name(idx, base):
    used = {v["version"] for v in idx["versions"]}
    name, n = base, 0
    while name in used:
        n += 1
        name = base + "abcdefghijklmnopqrstuvwxyz"[n - 1]
    return name


def page_checks(live_path, test_path):
    r = subprocess.run(["node", os.path.join(HERE, "page_checks.js"), live_path, test_path], cwd=ROOT)
    if r.returncode:
        stop("Page Checks failed (see above), so nothing was published. The live page is unchanged.")


def keep_current_live(idx, by):
    """The live page now, saved as a version if it isn't one yet (the first run, or a hand upload before this)."""
    live = test_copy.read(LIVE)
    s = sha(live)
    for v in idx["versions"]:
        if v["sha256"] == s:
            return v["version"], s
    name = new_name(idx, NOW.strftime("%Y%m%d-%H%M") + "-before")
    test_copy.write(os.path.join(REL, name + ".html"), live)
    idx["versions"].append({"version": name, "sha256": s, "savedAt": STAMP, "by": by,
                            "how": "the live page as it stood before this publish (it hadn't been saved as a version)"})
    return name, s


def publish(idx, by, note):
    was, live_sha = keep_current_live(idx, by)
    try:
        cand = test_copy.make_live(test_copy.read(TEST))
    except test_copy.NotATestCopy as e:
        stop("The test copy can't be published: " + str(e))
    if sha(cand) == live_sha:
        idx["live"] = was
        summary("The test copy is already live (version %s). Nothing to publish." % was)
        return "Publish: the test copy is already live as version " + was
    test_copy.write(os.path.join(BUILD, "index.html"), cand)
    page_checks(os.path.join(BUILD, "index.html"), TEST)
    name = new_name(idx, NOW.strftime("%Y%m%d-%H%M"))
    test_copy.write(os.path.join(REL, name + ".html"), cand)
    test_copy.write(LIVE, cand)
    idx["versions"].append({"version": name, "sha256": sha(cand), "savedAt": STAMP, "by": by,
                            "how": "published from the test copy" + (": " + note if note else "")})
    idx["history"].append({"at": STAMP, "by": by, "action": "publish", "version": name, "replaced": was})
    idx["live"] = name
    summary("Published version %s (replacing %s). To undo, run Publish a Version again with %s." % (name, was, was))
    return "Publish version " + name


def rollback(idx, by, version):
    if not re.fullmatch(r"[0-9]{8}-[0-9]{4}[a-z]?(-before)?[a-z]?", version):
        stop("'%s' isn't a version name. Version names look like 20261108-1530; the list is in releases/index.json."
             % version)
    entry = next((v for v in idx["versions"] if v["version"] == version), None)
    path = os.path.join(REL, version + ".html")
    if not entry or not os.path.exists(path):
        stop("There's no saved version %s. Saved versions: %s" % (version, ", ".join(v["version"] for v in idx["versions"])))
    was, _ = keep_current_live(idx, by)
    old = test_copy.read(path)
    if sha(old) != entry["sha256"]:
        stop("releases/%s.html doesn't match its fingerprint in releases/index.json, so it wasn't used." % version)
    try:
        test = test_copy.make_test(old)
    except test_copy.NotATestCopy as e:
        stop("Version %s can't be made live: %s" % (version, e))
    test_copy.write(os.path.join(BUILD, "test.html"), test)
    page_checks(path, os.path.join(BUILD, "test.html"))
    test_copy.write(LIVE, old)
    test_copy.write(TEST, test)
    idx["history"].append({"at": STAMP, "by": by, "action": "rollback", "version": version, "replaced": was})
    idx["live"] = version
    summary("Rolled back to version %s (replacing %s). The test copy was reset to match it; the changes that were in "
            "the test copy are still in the repository's history." % (version, was))
    return "Roll back to version " + version


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("action", choices=["publish", "rollback"])
    ap.add_argument("--version", default="")
    ap.add_argument("--by", default="")
    ap.add_argument("--note", default="")
    a = ap.parse_args()
    idx = load()
    idx.setdefault("versions", [])
    idx.setdefault("history", [])
    msg = publish(idx, a.by, a.note) if a.action == "publish" else rollback(idx, a.by, a.version.strip())
    save(idx)
    os.makedirs(BUILD, exist_ok=True)
    with open(os.path.join(BUILD, "commit-message.txt"), "w", encoding="utf-8") as f:
        f.write(msg + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
