#!/usr/bin/env python3
"""Member 360: the live page and the test copy (Jonna, Nov 8, 2026).

The test copy (test/index.html) is the live page (index.html) plus three test-only changes, and nothing else:
  1. right after <meta charset="utf-8">: tools/test-copy-head.txt (keeps search engines out, and blocks every save,
     upload and email so the test copy can read the real data but never change it)
  2. var PREVIEW = false;  becomes  var PREVIEW = true;
  3. right before the last </body></html>: tools/test-copy-tail.txt (the "Test copy" banner and ribbon)

Every change to Member 360 is made in the test copy. "Publish a Version" (.github/workflows/publish.yml) takes the
three changes back out with make_live() and makes the result the live page. make_test() is the reverse, used when
rolling back.

  python3 tools/test_copy.py make-live test/index.html OUT   the live page the test copy would publish
  python3 tools/test_copy.py make-test index.html OUT        the test copy for a live page
  python3 tools/test_copy.py check                           the test copy is the live page plus exactly the three changes
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CHARSET = '<meta charset="utf-8">'
LIVE_PREVIEW = "var PREVIEW = false;"
TEST_PREVIEW = "var PREVIEW = true;"
END = "</body></html>"


class NotATestCopy(Exception):
    pass


def read(path):
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def write(path, text):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


HEAD = read(os.path.join(HERE, "test-copy-head.txt"))
TAIL = read(os.path.join(HERE, "test-copy-tail.txt"))


def make_test(live):
    """The test copy for a live page."""
    if CHARSET not in live:
        raise NotATestCopy('The live page has no <meta charset="utf-8">.')
    if live.count(LIVE_PREVIEW) != 1:
        raise NotATestCopy("The live page must have exactly one 'var PREVIEW = false;' (saving switched on).")
    if HEAD in live or TAIL in live:
        raise NotATestCopy("That is already a test copy, not the live page.")
    if END not in live:
        raise NotATestCopy("The live page has no closing </body></html>.")
    i = live.index(CHARSET) + len(CHARSET)
    t = live[:i] + HEAD + live[i:]
    t = t.replace(LIVE_PREVIEW, TEST_PREVIEW, 1)
    j = t.rindex(END)
    return t[:j] + TAIL + t[j:]


def make_live(test):
    """The live page a test copy would publish. Refuses anything but the live page plus the three changes."""
    if test.count(HEAD) != 1:
        raise NotATestCopy("The test copy's test-only header (tools/test-copy-head.txt) is missing or changed. "
                           "Put it back exactly, or update tools/test-copy-head.txt in the same change.")
    if test.count(TAIL) != 1:
        raise NotATestCopy("The test copy's banner (tools/test-copy-tail.txt) is missing or changed. "
                           "Put it back exactly, or update tools/test-copy-tail.txt in the same change.")
    if test.count(TEST_PREVIEW) != 1:
        raise NotATestCopy("The test copy must have exactly one 'var PREVIEW = true;' (saving switched off).")
    live = test.replace(HEAD, "", 1).replace(TAIL, "", 1).replace(TEST_PREVIEW, LIVE_PREVIEW, 1)
    if make_test(live) != test:
        raise NotATestCopy("The test-only parts aren't where they belong (right after the charset line and right "
                           "before </body></html>).")
    return live


def main(argv):
    if len(argv) >= 1 and argv[0] == "check":
        root = os.path.dirname(HERE)
        live, test = read(os.path.join(root, "index.html")), read(os.path.join(root, "test", "index.html"))
        try:
            same = make_live(test) == live
        except NotATestCopy as e:
            print("The test copy can't be published: " + str(e))
            return 1
        print("The test copy matches the live page." if same else "The test copy has changes that aren't live yet.")
        return 0
    if len(argv) == 3 and argv[0] in ("make-live", "make-test"):
        try:
            out = (make_live if argv[0] == "make-live" else make_test)(read(argv[1]))
        except NotATestCopy as e:
            print(str(e))
            return 1
        write(argv[2], out)
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
