import contextlib,copy,importlib.util,io,json,pathlib,tarfile,tempfile,unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('release',pathlib.Path(__file__).resolve().parents[1]/'scripts/deploy-faq-20261029.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Guards(unittest.TestCase):
 def test_image_only_model_allowed(self):
  original={'services':{'V79website':{'image':'old','environment':{'A':'unchanged'}}},'networks':{'proxy':{}}}
  candidate=copy.deepcopy(original);candidate['services']['V79website']['image']='new'
  m.checked_model(original,candidate,'new')
  candidate['services']['V79website']['environment']['A']='changed'
  with self.assertRaisesRegex(RuntimeError,'beyond'):m.checked_model(original,candidate,'new')
 def test_archive_traversal_rejected_before_write(self):
  buf=io.BytesIO()
  with tarfile.open(fileobj=buf,mode='w:gz') as t:
   info=tarfile.TarInfo('repo/../escape');info.size=1;t.addfile(info,io.BytesIO(b'x'))
  with tempfile.TemporaryDirectory() as d:
   dest=pathlib.Path(d)/'source';dest.mkdir()
   with self.assertRaisesRegex(RuntimeError,'Unsafe archive'):m.extract_archive(buf.getvalue(),dest)
   self.assertFalse((pathlib.Path(d)/'escape').exists())
 def test_archive_symlink_rejected(self):
  buf=io.BytesIO()
  with tarfile.open(fileobj=buf,mode='w:gz') as t:
   info=tarfile.TarInfo('repo/link');info.type=tarfile.SYMTYPE;info.linkname='/etc/passwd';t.addfile(info)
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaisesRegex(RuntimeError,'links'):m.extract_archive(buf.getvalue(),pathlib.Path(d))
 def fixture(self,image=None):
  return {'Image':image or m.OLD_IMAGE,'State':{'Health':{'Status':'healthy'}},'Config':{'Labels':{'com.docker.compose.project':m.PROJECT,'com.docker.compose.service':m.SERVICE,'com.docker.compose.project.working_dir':str(m.ROOT),'com.docker.compose.project.config_files':str(m.CONFIG)}}}
 def test_changed_live_image_stops_before_command(self):
  with patch.object(m,'inspect',return_value=self.fixture('sha256:changed')),patch.object(m.socket,'gethostname',return_value='v79sl'),patch.object(m,'run') as run,patch('sys.argv',['release','--revision','a'*40,'--apply']):
   with self.assertRaisesRegex(RuntimeError,'Live image changed'):m.main()
   run.assert_not_called()
 def test_baseline_code_mismatch_stops_before_build(self):
  with patch.object(m,'inspect',return_value=self.fixture()),patch.object(m.socket,'gethostname',return_value='v79sl'),patch.object(pathlib.Path,'is_file',return_value=True),patch.object(pathlib.Path,'is_dir',return_value=True),patch.object(m,'run',return_value='{}') as run,patch('sys.argv',['release','--revision','a'*40,'--apply']):
   with self.assertRaisesRegex(RuntimeError,'Runtime differs'):m.main()
   self.assertEqual(run.call_count,1)
 def test_preflight_performs_no_mutations(self):
  calls=[]
  def command(args,**kwargs):
   calls.append(args)
   if args[0:3]==['docker','exec','V79website']:return json.dumps(m.BASELINE_FILES)
   self.assertEqual(args[-3:],['config','--format','json'])
   return json.dumps({'services':{'V79website':{'image':'existing'}}})
  with patch.object(m,'inspect',return_value=self.fixture()),patch.object(m.socket,'gethostname',return_value='v79sl'),patch.object(pathlib.Path,'is_file',return_value=True),patch.object(pathlib.Path,'is_dir',return_value=True),patch.object(m,'run',side_effect=command),patch('sys.argv',['release','--revision','a'*40]),contextlib.redirect_stdout(io.StringIO()) as output:
   m.main()
   self.assertIn('PRODUCTION_CHANGES=NONE',output.getvalue())
  self.assertEqual(len(calls),2)
unittest.main()
