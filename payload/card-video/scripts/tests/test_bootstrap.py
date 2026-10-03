import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('bootstrap', Path(__file__).parents[1]/'bootstrap.py')
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

class BootstrapTests(unittest.TestCase):
    def test_windows_x64_and_mac_arm_mapping(self):
        for system, machine, expected in [('Windows','AMD64','win-x64'),('Darwin','arm64','darwin-arm64')]:
            with patch.object(b.platform,'system',return_value=system), patch.object(b.platform,'machine',return_value=machine):
                self.assertEqual(b.platform_key(),expected)
        with patch.object(b.platform,'system',return_value='Windows'), patch.object(b.platform,'machine',return_value='arm64'):
            with self.assertRaises(RuntimeError): b.platform_key()

    def test_checksum_failure_never_extracts(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            lock={'nodeVersion':'v-test','nodeArchives':{'win-x64':{'extension':'zip','sha256':'0'*64}}}
            from io import BytesIO
            with patch.object(b,'ROOT',root), patch.object(b,'LOCK',lock), patch.object(b,'platform_key',return_value='win-x64'), patch.object(b.urllib.request,'urlopen',return_value=BytesIO(b'corrupt')):
                with self.assertRaisesRegex(RuntimeError,'校验失败'): b.download_node()
                self.assertFalse((root/'.runtime/node').exists())

    def test_verified_archive_still_rejects_path_traversal(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder); archive=root/'.runtime/downloads/node-v-test-win-x64.zip';archive.parent.mkdir(parents=True)
            with zipfile.ZipFile(archive,'w') as z: z.writestr('../../escape','bad')
            lock={'nodeVersion':'v-test','nodeArchives':{'win-x64':{'extension':'zip','sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}}}
            with patch.object(b,'ROOT',root), patch.object(b,'LOCK',lock), patch.object(b,'platform_key',return_value='win-x64'), patch.object(b.urllib.request,'urlopen') as network:
                with self.assertRaisesRegex(RuntimeError,'越界'): b.download_node()
                network.assert_not_called()
                self.assertFalse((root/'escape').exists())

if __name__ == '__main__': unittest.main()
