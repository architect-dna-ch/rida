#!/usr/bin/env python3
import json, sys, subprocess, os

shots = sys.argv[1]
result = sys.argv[2]

data = json.loads(subprocess.check_output(
    ['xcrun', 'xcresulttool', 'get', '--path', result, '--format', 'json'],
    stderr=subprocess.DEVNULL
))

n = 0

def walk(obj):
    global n
    if isinstance(obj, dict):
        if obj.get('_type', {}).get('_name') == 'ActionTestAttachment':
            fname = obj.get('filename', {}).get('_value', '')
            if fname.endswith('.png'):
                ref = obj.get('payloadRef', {}).get('id', {}).get('_value', '')
                if ref:
                    out = os.path.join(shots, f'{n:02d}_{fname}')
                    subprocess.run([
                        'xcrun', 'xcresulttool', 'export',
                        '--path', result,
                        '--id', ref,
                        '--output-path', out,
                        '--type', 'file'
                    ])
                    n += 1
        for v in obj.values():
            walk(v)
    elif isinstance(obj, list):
        for v in obj:
            walk(v)

walk(data)
print(f'Extracted {n} screenshots to {shots}')
