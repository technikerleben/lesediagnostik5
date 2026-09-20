"""Dependency-free PNG integrity + item asset reference check (Python 3)."""
from pathlib import Path
import json
import struct
import zlib
ROOT = Path(__file__).resolve().parents[1]
assets = ROOT / 'assets' / 'lesebilder'
for file in sorted(assets.glob('*.png')):
    data = file.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', file
    pos, compressed, ended, header = 8, b'', False, None
    while pos < len(data):
        assert pos + 12 <= len(data), (file, 'short chunk')
        length, = struct.unpack('>I', data[pos:pos + 4])
        kind = data[pos + 4:pos + 8]
        end = pos + 8 + length
        assert end + 4 <= len(data), (file, 'truncated chunk')
        payload = data[pos + 8:end]
        assert zlib.crc32(kind + payload) == struct.unpack('>I', data[end:end + 4])[0], (file, kind, 'CRC')
        if kind == b'IHDR':
            header = struct.unpack('>IIBBBBB', payload)
        if kind == b'IDAT':
            compressed += payload
        pos = end + 4
        if kind == b'IEND':
            assert length == 0 and pos == len(data), (file, 'end marker')
            ended = True
            break
    assert ended and header, file
    width, height, depth, color, compression, filtering, interlace = header
    assert depth == 8 and interlace == 0 and compression == filtering == 0, (file, 'unsupported format')
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    scanlines = zlib.decompress(compressed)
    stride = width * channels + 1
    assert len(scanlines) == height * stride, (file, 'scanline size')
    assert all(scanlines[row * stride] <= 4 for row in range(height)), (file, 'filter')
for file in (ROOT / 'data' / 'sets').glob('*.json'):
    data = json.loads(file.read_text())
    items = [item for section in data['sections'] for item in section['items']] + data.get('reserveItems', [])
    for item in items:
        for option in item.get('options', []):
            if option.get('asset'):
                assert (assets / (option['asset'] + '.png')).is_file(), (file, item['id'])
print('PASS: all 27 PNGs (CRC, complete decompression, scanlines) and active/reserve asset paths')
