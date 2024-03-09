#!/usr/bin/env python
import json
import sys
from pathlib import Path


def process(args):
    ok = True
    with Path(args.file[0]).open() as fp:
        obj1 = json.load(fp)
    with Path(args.file[1]).open() as fp:
        obj2 = json.load(fp)
    ks1,ks2 = set(obj1), set(obj2)
    for k in ks1:
        if (k not in ks2):
            print(f'! missing {k}', file=sys.stderr)
            ok = False
    for k in ks2:
        if (k not in ks1):
            print(f'! extra {k}', file=sys.stderr)
            ok = False
    if not ok:
        exit(1)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('file', nargs=2, help='the files to compare')
    args = parser.parse_args()
    process(args)
