#!/usr/bin/env python3
"""Pinned website-only FAQ release; leaves the existing source tree and data intact."""
import argparse
import copy
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import socket
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.request

OLD_IMAGE = 'sha256:00ebb4212a271bbc9400fcf373f72bf02cb4287b07a41e7b2b650e18a34dade2'
ROOT = Path('/home/firelion/website2026')
CONFIG = Path('/home/firelion/v79-newsletter-website-release-20261028/V79website.candidate.json')
SERVICE = 'V79website'
PROJECT = 'website2026'
BASELINE_FILES = {
    '/app/dist/server/server.cjs': '422c7a16fc543827f1e401883d418f58729f2614b11718964cb09e4fe33b4539',
    '/app/package.json': 'ece97a3b3e99f830207ad04d356fe76cf94f2a0b3c8e9e4ec31e155f85dfa6aa',
    '/app/package-lock.json': '12efad18ffc6d98594b23ed7d33062866bf5f3823dc989c7fa3afae85f75c02c',
}
SOURCE_HASHES = {
    ".dockerignore": "8486e27a31d13389049dab3596b19f79c387e88d67af5864c72aaffab0eaf4cd",
    ".env.example": "af42854451beea3ca22bc8476c7d4cb1deac1c27e916953dec94b4ee3d8c4fb5",
    ".gitattributes": "1a1dbe176bc233b499d35a57db7513f2941c99ab9759f177830c9149be99005b",
    ".github/dependabot.yml": "a181799c6da6a354d27bde9e4bcf0b57f1db9c97c5739df8011395410d3405af",
    ".github/workflows/ci.yml": "5964950f45932f89c0dde9326f70ea5d3d0cebc7736b76a7f5563bc56fe4f38a",
    ".github/workflows/delivery.yml": "c6a47ffcc45c12f9a4664fac2c729d030c75801549d6d17113ab7a7ce9bc700e",
    ".gitignore": "3909c6530564efd9e53231772333ff3574f618e1d1855653a185a51543ef450a",
    "DESIGN_REVIEW.md": "aed4d4e97b0cbd4e6c7eeb8b3c9fbb61a387644524f9f77fa91da27e54e320bf",
    "Dockerfile": "bddc59e60554c35f6fe2c1f48c23ce38dd4eb9c3bd6729ea4aa484a5d6c15bb3",
    "PRODUCTION.md": "4b8c865c93d9d57d057d47d3180985c61671a9c0e3941d3b2fe46957163d2f04",
    "README-INTEGRATION.md": "2c944a0b9e66e6f1198e00c2a92d019cc338dc2f9174115b9232de5e8de3a868",
    "README.md": "ef831163af6123deec3c860e84db9ffd4bf14b460856449b8b885ec3e9fc4c06",
    "SECURITY.md": "c202aacaa7e3bc67f05925021672929f4448cf2edec11a893434a0c8c3f6e90d",
    "admin.html": "5b8c21d044fbff2d253d3515408f4cca6234d5f0801131e913cce22f423833a6",
    "data/articles/cybersecurity-best-practices.md": "6018aae6ecee5567b469fe62b49f5ebc879cb20ef2d83758dbf3babad8f2566e",
    "data/articles/digital-transformation-and-telecoms-saint-lucia.md": "f9da0b27f4838d23c25e2c8a6b778fcd852f6e41ccd1bff7951ccd7166aa69bd",
    "data/articles/how-to-choose-it-support-saint-lucia.md": "ed12e1c2653c6164578e2883938d29a43176612e5f755729e2814d244acc3e5e",
    "data/articles/how-to-prompt-ai-for-better-results.md": "1dd87e99b02d49de1cb12c8aefbbe75dcf94d081ec593f6a613b8b0f896e1832",
    "data/articles/importance-of-cloud-backups.md": "7a7949a66510c5c214f7eab0767d2f90f4ab91a3cf314914a2233e9d35ce14b1",
    "data/articles/migrating-to-microsoft-365.md": "c94b0e7160055e57f49c2cf6a37ab9e1eae030a910784efb30a1c115e91c0be2",
    "data/articles/network-design-and-implementation-caribbean.md": "7ebfdecf94f6dd2da3b1b5eb4dcfc83a91f04dbeac52fa57412ad6b599dc5117",
    "docker-compose.yml": "a05a0f5af44a10b8cd9dca2f18c141df0e4a273d59a28d2deb6583ebd4c42755",
    "docs/newsletter-preferences-20261028.md": "7fa0fa0a483e7a147b7446f3e9eac0850040ca1fd858e5eafb4fb52171ae3a0b",
    "index.html": "648ff3f3a1db1abc92adedf963133fb587cc1cd291ccc12248828470fd6e179f",
    "metadata.json": "38323decfc781a8fe1ee5ebb4dc76638d2ac26d42b11aa6d0b5eaa93e6cfc9b2",
    "package-lock.json": "12efad18ffc6d98594b23ed7d33062866bf5f3823dc989c7fa3afae85f75c02c",
    "package.json": "ece97a3b3e99f830207ad04d356fe76cf94f2a0b3c8e9e4ec31e155f85dfa6aa",
    "public/apple-touch-icon.png": "d74ae0240a4d91bdb883422f35e76942603c77c7692a345388c9eadf80eb8a46",
    "public/favicon-16x16.png": "b662d20aab87b7b891a5c06d98cb929b9dd4cadeac272644d28bacb2bedf1129",
    "public/favicon-32x32.png": "fd2b13753fbc9cdf822330f7a88ed0482761daf1f2445c6be3195b8a1626d0dc",
    "public/favicon.ico": "8d1e3afeab97a1e7336f88781af1c9dd65fbfa5a80976fa84cb53cbbee079c0a",
    "public/favicon.png": "82f75d76a6337094ea8e02feb6dcb654fcf382ab1d7bac2beb86a45727a6805a",
    "public/favicon.svg": "27e905ffcc849ef72572d4e23830b5d01b37de16ab5961f3e2edf789ab725159",
    "public/llms.txt": "3838b4c111c3ff4f41f5a2138328836d73c996e6eea00b2ff9ccee584fa67174",
    "public/og-image.png": "deeac2246e39e61600bbad9ac26833a57c4d4a63b6eb44289cdce66e29794be1",
    "public/privacy.html": "5fd4408aba4f8b9d1a72f87d3b27eac3826c6f4768699d74b8e92f4412178173",
    "public/robots.txt": "480f814caad1a9dacdc6cb2ba4573168ebbf101c41ca5a85ae959cc6b275653f",
    "public/sitemap.xml": "beda3e2aa74eba78d7eb45d10cf678929fc6ee2b31fe1ccc62553e5a9dfc5cac",
    "public/v79-digital-logo.svg": "27e905ffcc849ef72572d4e23830b5d01b37de16ab5961f3e2edf789ab725159",
    "public/v79-digital-original.png": "84cf7d89807b3d8c2aee4d864a37f777854a23d045853adf7b192101ce6b9de1",
    "public/v79-footer-dark.png": "45a62bae49d404b4b57644d442b74b762508a34fe8a6aed6ace78e19ad35708f",
    "public/v79-footer-light.png": "7c1a5119d185ae5e3f92d737d52473cc2847158575ef79c80c15c55371445786",
    "public/v79-mark.png": "115c60b7976598e09ca01813af03d316475fa35488fe0e5b923db8f5eeb41744",
    "public/v79-official-logo.png": "115c60b7976598e09ca01813af03d316475fa35488fe0e5b923db8f5eeb41744",
    "public/v79-official-logo.svg": "aba3432329a4214d95870a5d6ad186948c951e67228684734552776fd496fd8e",
    "scripts/deploy-server.sh": "205b7202af29029e6bd59948042b1409cbef19e6379f960ba0c690ec174d9d18",
    "scripts/export-legacy-sqlite.mjs": "735c9e91a1ce224869236e0d433711c7d48163d9bf174c1235f66672fe8a82ca",
    "scripts/generate-favicons.mjs": "ba3020b3cb2c33a9f56762ab6344d41b1204a3d175a852247ae8a23bdc235293",
    "server.ts": "8b5c2a5634434c25772455b0a90ce63236ea13d210dfad48ffe9b5a7df9fdf60",
    "server/aiPromptGuidePdf.ts": "6e4d2b61e680651297159b1529fdd511e0fd82878a2040dbda320c41fd679630",
    "server/crm_engine.ts": "6ad11520372b11518ca6c4233daf78c036b2d99e94ce3f5a132c34c519cdf8aa",
    "server/crm_storage.ts": "cff833f0593f1adbaa2c61068f0f4de719d37509181b3275953031ce7dbffa88",
    "server/hub-event-replay.ts": "40168ae08b2e1daa5046c1273342570ac010eb08a3979eb5a0faa1073ae8a8fe",
    "server/learners.ts": "d73a1467ede7a2e1f04c43792f70448af9be4b22b81f6c189836b5911cd83fbb",
    "server/newsletter.ts": "45b1e6d7cdb5c1fa0111c8848b9a3e3fb786e476aafb17edb8bd58578dde168e",
    "server/persistence.ts": "08d17bbb51413189627cf36d8c66338465dde8052f522dea4898b361f1b079f7",
    "server/platformEvents.ts": "1b2c537e384d39741956057929d0d5edcbd5005130d2d42f0b6ae5eae2091326",
    "src/AdminApp.tsx": "1aecdefdfc6d1b129159dba9d4242e462c345db2778571923b427e8e54132cec",
    "src/App.tsx": "0a1091a585c11e58856a7cd66df3d845ae33524ed11a7caa44cd681448a70e8e",
    "src/admin.tsx": "ea47a2538eec675dd9db596306c80713e01fab44b8cdb7a58caf40cab6809e50",
    "src/assets/images/V79website.png": "6930e9d565528de7b147ae4fa372d2ed71804fa94432ef85c098fb3246de05c8",
    "src/components/AIPromptGuideLandingPage.tsx": "0fa8034165ab35269719dab21301f7d6c6cd704fa4293d65a702a50f7a0a2184",
    "src/components/AboutPage.tsx": "78b632abc0c5df47d35a1e765332441a4059be2c9770f98df901673832cfecb8",
    "src/components/AppLogo.tsx": "a460fa1012a9bf7ec4b6c00b22f3a4c3693cfe22c6376e75c22ba34c1bb9a308",
    "src/components/ArticleDetailPage.tsx": "6109e401a28978c056a77364f212f47971b82ad23f36562890f4a43f453bd12f",
    "src/components/ContactPage.tsx": "10d35f63de02bf2142c1ff8d614e6ac27a29d91dd2eaa9e2d0e876fcacf8d417",
    "src/components/CourseBuilder/AICourseAssistantModal.tsx": "0ab02ffc8f1e7f93056421e9e24b0e49627db6b6a57e8fee2ac385b1f2dedd8a",
    "src/components/CourseBuilder/AssetManager.tsx": "fb09a85b5792b1a987fdc15847f772e6ecb35223e499b3b5f3bb977a5f1c9174",
    "src/components/CourseBuilder/CourseBuilderPanel.tsx": "a857fab481cba6e6e99e666e14c7069839b16d4bfd4c8081ce7af161479a8c16",
    "src/components/CourseBuilder/CourseEditor.tsx": "93c9a351a4daa5f99c9950163dfe31a0fac504ab82e7054432b702f21a0c66e5",
    "src/components/CourseBuilder/CourseList.tsx": "c26840fae684dd80ab5a5128a0241e01780ecea1ecce5326fce3fa532e6532e8",
    "src/components/CourseBuilder/CoursePreview.tsx": "13a2f60c064fdc670704f7b9363234be5baee931c441f5f1d028e0313ae3caf0",
    "src/components/CourseBuilder/Dashboard.tsx": "38846e0c6528daa04b2e83aca69b5d8ab2eb1c9cb1b07ebe8e1343226dfffc53",
    "src/components/CourseBuilder/ExportModal.tsx": "69ede3ecf10ae82c4962deb447418ed409b7b8719efc03239db31e610bed3328",
    "src/components/CourseBuilder/Header.tsx": "e19541fd58d0ad72696ce641683435bd51a22311139a0f846b4077a40c903c50",
    "src/components/CourseBuilder/ModuleLessonManager.tsx": "dc9de2a11985f8351abd2d985a1aefb4717630cf6c1c91c77ca09961e42af078",
    "src/components/CourseBuilder/QuizBuilder.tsx": "7e471321e96195314824ad7d198f5dd229a372baea7a73b3f8a6ee3e7f3f08cb",
    "src/components/CourseBuilder/Sidebar.tsx": "c7b6360feea7a87bf9b83105d8e59875b1e8fbb89bd27fbc846469557e841d31",
    "src/components/CourseBuilder/cbApi.ts": "56d11fd459ae2ed49f0878deaef108a008e923367c524ce76e7da34b5cea742f",
    "src/components/CourseBuilder/courseBuilderTypes.ts": "472d7968cb430f66ba4cf7e347e9e39eb39298f861907b97a356d390fabba003",
    "src/components/CourseCertification.tsx": "e30eab7373a161179484a1e34b89f0e570223884e976188c79f0834f9aed2e0f",
    "src/components/CourseDetailPage.tsx": "11d47fa2d54da076fea7a382d05c023cad5039921931391e51deba19d476f9f7",
    "src/components/ExamModule.tsx": "320bc058b1edf79f9fb56fbc28df7e3a0b495ecd7c03acb4d7e98e24d9163643",
    "src/components/FAQPage.tsx": "525644e0b4ea04c5d033771465f9dc36ba8702be6d1d7626d4bafce96222163b",
    "src/components/HomePage.tsx": "eab8cb9b68fbd0a91ded7cfb1fe40400567d42a0c7ec154e733eb1d4e4e71383",
    "src/components/IndustriesPage.tsx": "080a1d1c4147919f6f5fffec09faec3efdc96ed63a2cb75e5843414e05710ccf",
    "src/components/LearnerAccess.tsx": "741b538010640d9d3311f3b77f9d78085b064212ec5a7c7bae8ff2e6b2fb8e25",
    "src/components/LegalPage.tsx": "f67e2540266ad27ad2e7533ba214a939eb60486745fa9fd2c793e9eff881c712",
    "src/components/OnboardingFeedback.tsx": "ef86a43483ac160c2c15a75c0a51b07f0c04ad9300e10d401b494e93b1781e9c",
    "src/components/OperationsPanel.tsx": "8e508440b9b4c69fd80f913ed930a38d2ba45636295c870b4e285ef0c52df4f9",
    "src/components/ResourcesPage.tsx": "415fd3e4e28f52fbf1d505ae51a095e1c31bc2ff49d1edaaa350626c8f337589",
    "src/components/ServicesPage.tsx": "f1ac3e50c0bc23ac9d75397d940bacf97d4e2ac743996eac60cbef6f763d7170",
    "src/components/ServicesPriceList.tsx": "163e409f14c051e5d697bfe6ec341352478e441d5cb1e1313c3f90d26288cdf8",
    "src/components/ShareButtons.tsx": "4e3017c66fa78ee18a7b4de1caf2a6e4e97694ee9eeed3d00f9b72e595e98ff9",
    "src/components/V79OfficialLogo.tsx": "f970e4759d35f05bfd597e26485e661dbfbc18131abf7fb09115d16ccf35f20d",
    "src/components/blog/BlogManager.tsx": "c9aec38f2f33274d8eee35bc88417dde41a062aa9f035d78d60c881bed4dce11",
    "src/components/certificateImage.ts": "d9ade3987507a4e22b18dc7b0de26aa56ce54677e49eca5207db370887f3f5cc",
    "src/components/crm/CrmColdCallCockpit.tsx": "c95e45ef05451db7edca86059c46c697057291adbd7d3732f1309eb314032e34",
    "src/components/crm/CrmHeader.tsx": "afea8eda0e52b25a14020728ac1e5381c0d284231b42e1efb7813fdc0aef49e2",
    "src/components/crm/CrmLeadDetailModal.tsx": "b2c8069a0d04cf682f1dcfeb7905454c98665753637999a63cd3fbddd362b33e",
    "src/components/crm/CrmLeadTable.tsx": "f5a30f1754bdd5cd283cbc6970c3feaeea39bdb420acc32ac2ead4e04572ced7",
    "src/components/crm/CrmManager.tsx": "8c07a89cd7044bdabaf0ad7aeb7bdabc75ab2ef50c64d6c5c7d0912d381fbd42",
    "src/components/crm/CrmMetricsDashboard.tsx": "b37e9092b78f6590bcd7a6b779fd4dbecd48e345c4e4510abdcf6d3b46223630",
    "src/components/crm/CrmNewLeadModal.tsx": "4b126017c4a71a875b3dec53d139cf9c20d8f8b198e667810316fca972afba9c",
    "src/components/crm/CrmPipelineBoard.tsx": "ba4a295247b5cac20ea03da9178b0304cb3ad0e38ac6b926f17c6a0d265cab81",
    "src/components/crm/CrmProspectFinder.tsx": "59b0e043ecaa81730fecb6e6bc65eef925eda5b10c228a4dad9ad672d308662f",
    "src/components/crm/CrmSettings.tsx": "8b8115bd0c3562cae0c9addfa2573c44f1e108c674e874b96445dfe860f7dab7",
    "src/components/crm/CrmTasksList.tsx": "c1a46e95e1632a9cce30ac5d1cb13e4d274bf6c27eb766b9c30e5803402b25c7",
    "src/components/faq.css": "5ae11c370bfe1ea631bce93c89367aa77aff8a5438c698914d5506f20aef6b86",
    "src/components/interactive/DowntimeRiskCalculator.tsx": "6e4690d3123eadd53d8922e27c99e69abbeeea8ec57150a54e50e0a154abe96c",
    "src/components/interactive/LiveNocTerminal.tsx": "a8b069d1f721b0cb9dda6fba1429e83ba364bd034e727788a59b57726d9e3457",
    "src/components/interactive/StormFailoverSimulator.tsx": "bb20795510d2bed70215999ab358fdf91bf0aac780926a6906aa61a5272cd4f4",
    "src/components/ui/Button.tsx": "aa5f5858c9a7a7d5c4e9c38a543918f337b81ae7aa7371415afc42a4fe3ed74d",
    "src/components/ui/FieldError.tsx": "67ab25491991eb6228641786fb9ed3f541ddcd72b9fdf503f1d4c55ecf5a5886",
    "src/components/ui/Skeleton.tsx": "ce432ebbfa4aa597a6cc26e41936f3c99e3cafd5595f715a21a0f637995b9b44",
    "src/crm/types.ts": "aaf5095231ae01a630aacac36afcf26df539da5e414e35c986c51507d3ce71d1",
    "src/data/faqs.ts": "bc46f1dfc018a95dde06cd4dcdbf5bc5edc370c8382ca4528b8090f80d119a24",
    "src/data/testimonials.ts": "802952f1ef1f33feca4139e3319280be8d841d4f1631537e9584ec8ed97aff75",
    "src/index.css": "a11d0e40b95818f64746af3afbb73116ef3360b757857696717ef3138ce822bb",
    "src/main.tsx": "5580d48b0fec68698a113d45a640b88d479dc35eb1f4b87c51f67c6cc81cee9b",
    "src/types.ts": "84f6f76110df98c80104dfd2d505a9296c38dadf088f5060d43ce2a2bc80aba0",
    "src/utils/scroll.ts": "e380c65d0f085c9648a73920f6efb09c06896239056aec56fcd21942806e0919",
    "src/vite-env.d.ts": "65996936fbb042915f7b74a200fcdde7e410f32a669b1ab9597cfaa4b0faddb5",
    "tests/ai-prompt-guide-pdf.test.ts": "4ea68d4beec0dd62611170bbdecd7f712b3410b2724d5733aa20177cee4ad86e",
    "tests/faq_release_guards.py": "7636319b2f70841ec2cfd290e815ccc4eb90201358c35a003f36fa6b549eb1fc",
    "tests/hub-event-replay.test.ts": "6d545d5e8f829d6af4ad5553755b4dc610c6deb4f94f1d5cf82b175dca6d76ad",
    "tests/newsletter-production.test.ts": "62026d39a71088cf116bda5adfa4f9970f3aa81217c0ccc48291197a7509a2a1",
    "tests/newsletter.test.ts": "a5829bd2e574733813f31ec305e0e0e8677ee4b95c28f25473e6f607064853ce",
    "tests/production.test.ts": "6f36323143c4e38b2f54bbb4687811506adcd60240d82a7b4f7b2f19ac271c0b",
    "tests/storage.test.ts": "ae09588f763bf67ddd6a4fb3a2df7b466aa14eddf9d5e39bbda23850aa81e49f",
    "tsconfig.json": "94c1efd22a18ac53333e8b8ae0d82d0af3ac9de6afe8ac0b919b5b07c0b7fa82",
    "tsconfig.server.json": "fa1a88901e658dd55e15e8b33c6cb459e48ccf2fc6501c745548b5ce9fd7556b",
    "vite.config.ts": "bde04e8f4f9933a5d940c2536ecf15c391955c44820b3dbd2a99b76cc3380760"
}


def require(value, message):
    if not value:
        raise RuntimeError(message)


def run(args, *, cwd=None):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    require(result.returncode == 0, 'Command failed: ' + ' '.join(args[:3]) + ' (private output withheld)')
    return result.stdout


def inspect(name=SERVICE):
    return json.loads(run(['docker', 'inspect', name]))[0]


def mounts(container):
    return sorted((m['Type'], m['Source'], m['Destination'], m['RW']) for m in container['Mounts'])


def checked_model(before, after, image):
    expected = copy.deepcopy(before)
    expected['services'][SERVICE]['image'] = image
    require(after == expected, 'Compose model changed beyond the website image')


def extract_archive(data, destination):
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        members = archive.getmembers()
        require(sum(m.size for m in members) < 300_000_000, 'Source archive exceeds limit')
        prefixes = {PurePosixPath(m.name).parts[0] for m in members}
        require(len(prefixes) == 1, 'Unexpected archive roots')
        for member in members:
            parts = PurePosixPath(member.name).parts
            require(not member.name.startswith('/') and '..' not in parts, 'Unsafe archive path')
            require(member.isdir() or member.isfile(), 'Archive links and special files are not permitted')
            if len(parts) == 1:
                continue
            output = destination.joinpath(*parts[1:])
            if member.isdir():
                output.mkdir(parents=True, exist_ok=True, mode=0o755)
            else:
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(archive.extractfile(member).read())
                output.chmod(0o644)
    for path in destination.rglob('*'):
        if path.is_dir():
            path.chmod(0o755)
    actual = {str(p.relative_to(destination)) for p in destination.rglob('*') if p.is_file()}
    require(actual == set(SOURCE_HASHES) | {'scripts/deploy-faq-20261029.py'}, 'Source file inventory mismatch')
    for name, digest in SOURCE_HASHES.items():
        require(hashlib.sha256((destination / name).read_bytes()).hexdigest() == digest, 'Source checksum mismatch: ' + name)


HTTP_CHECK = r"""
(async()=>{
 for(const endpoint of ['/api/ready','/faq','/contact','/sitemap.xml']){
  const r=await fetch('http://127.0.0.1:3000'+endpoint,{signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw Error('HTTP check failed');
  const text=await r.text();
  if(endpoint==='/faq'&&(!text.includes('AI &amp; Business Technology FAQ')||(text.match(/<section id="q\d+">/g)||[]).length!==10))throw Error('FAQ content mismatch');
  if(endpoint==='/sitemap.xml'&&!text.includes('/faq</loc>'))throw Error('FAQ sitemap missing');
 }
})().catch(()=>process.exit(1));
"""


def http_check(container, attempts=1):
    for attempt in range(attempts):
        result = subprocess.run(['docker', 'exec', container, 'node', '-e', HTTP_CHECK], capture_output=True)
        if result.returncode == 0:
            return
        if attempt + 1 < attempts:
            time.sleep(1)
    raise RuntimeError('Read-only HTTP checks failed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--revision', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    require(re.fullmatch('[a-f0-9]{40}', args.revision), 'Invalid source revision')
    require(socket.gethostname() == 'v79sl', 'Run only on v79sl')
    before = inspect()
    require(before['Image'] == OLD_IMAGE, 'Live image changed; no deployment performed')
    require(before['State'].get('Health', {}).get('Status') == 'healthy', 'Website must be healthy before release')
    labels = before['Config'].get('Labels') or {}
    require(labels.get('com.docker.compose.project') == PROJECT, 'Unexpected Compose project')
    require(labels.get('com.docker.compose.service') == SERVICE, 'Unexpected service')
    require(labels.get('com.docker.compose.project.working_dir') == str(ROOT), 'Working directory changed')
    require(labels.get('com.docker.compose.project.config_files') == str(CONFIG), 'Compose file changed')
    require(CONFIG.is_file() and ROOT.is_dir(), 'Existing deployment configuration missing')
    # Bind the known image to the newsletter bundle and exact runtime dependencies.
    proof = run(['docker', 'exec', SERVICE, 'node', '-e',
        "const fs=require('fs'),c=require('crypto');console.log(JSON.stringify(Object.fromEntries(" + json.dumps(list(BASELINE_FILES)) + ".map(p=>[p,c.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))))"])
    if json.loads(proof) != BASELINE_FILES:
        print('RUNTIME_FINGERPRINTS=' + proof.strip(), flush=True)
        raise RuntimeError('Runtime differs from the tested newsletter baseline; no changes made')
    compose = ['docker', 'compose', '--project-name', PROJECT, '--project-directory', str(ROOT), '-f', str(CONFIG)]
    original_model = json.loads(run(compose + ['config', '--format', 'json']))
    require(SERVICE in original_model['services'], 'Website missing from Compose configuration')
    print('FAQ_PREFLIGHT=PASS_EXACT_NEWSLETTER_IMAGE_AND_RUNTIME', flush=True)
    if not args.apply:
        print('PRODUCTION_CHANGES=NONE')
        return

    release = Path(tempfile.mkdtemp(prefix='v79-faq-release-', dir=Path.home()))
    source = release / 'source'
    source.mkdir()
    request = urllib.request.Request('https://codeload.github.com/MrFixITslu/v79website/tar.gz/' + args.revision, headers={'User-Agent': 'V79-FAQ-Release'})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read(100_000_001)
    require(len(data) <= 100_000_000, 'Source download exceeds limit')
    extract_archive(data, source)
    # Build only the new application output; keep the original runtime dependencies.
    base_tag = 'v79website:faq-base-00ebb4212a27'
    run(['docker', 'tag', OLD_IMAGE, base_tag])
    require(json.loads(run(['docker', 'image', 'inspect', base_tag]))[0]['Id'] == OLD_IMAGE, 'Base tag pin mismatch')
    dockerfile = source / 'Dockerfile.faq-release'
    dockerfile.write_text('FROM node:24-alpine AS builder\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run lint && npm run build\nFROM ' + base_tag + '\nCOPY --from=builder --chown=node:node /app/dist /app/dist\nLABEL org.opencontainers.image.revision="' + args.revision + '"\n')
    image_tag = 'v79website:faq-' + args.revision[:12]
    log = release / 'build.log'
    print('FAQ_BUILD=STARTED; LOG=' + str(log), flush=True)
    with log.open('w') as output:
        result = subprocess.run(['docker', 'build', '-f', str(dockerfile), '-t', image_tag, str(source)], stdout=output, stderr=subprocess.STDOUT)
    require(result.returncode == 0, 'Candidate build failed; production unchanged. See ' + str(log))
    image = json.loads(run(['docker', 'image', 'inspect', image_tag]))[0]['Id']
    smoke = 'v79-faq-smoke-' + args.revision[:12]
    smoke_id = run(['docker', 'run', '-d', '--name', smoke, '--network', 'none',
        '--tmpfs', '/app/data:rw,uid=1000,gid=1000,mode=0700',
        '--tmpfs', '/app/uploads:rw,uid=1000,gid=1000,mode=0700',
        '-e', 'CAPTCHA_MODE=disabled', image]).strip()
    try:
        http_check(smoke_id, attempts=30)
        runtime = run(['docker', 'exec', smoke_id, 'node', '-e',
            "const fs=require('fs'),c=require('crypto');console.log(JSON.stringify(Object.fromEntries(['/app/package.json','/app/package-lock.json'].map(p=>[p,c.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))))"])
        require(json.loads(runtime) == {k:v for k,v in BASELINE_FILES.items() if k != '/app/dist/server/server.cjs'}, 'Runtime dependency metadata changed')
    finally:
        subprocess.run(['docker', 'rm', '-f', smoke_id], capture_output=True)
    print('FAQ_ISOLATED_BOOT=PASS_NO_PRODUCTION_MOUNTS_OR_NETWORK', flush=True)
    override = release / 'faq.image.json'
    rollback = release / 'previous.image.json'
    override.write_text(json.dumps({'services': {SERVICE: {'image': image}}}))
    rollback.write_text(json.dumps({'services': {SERVICE: {'image': OLD_IMAGE}}}))
    candidate_command = compose + ['-f', str(override)]
    checked_model(original_model, json.loads(run(candidate_command + ['config', '--format', 'json'])), image)
    current = inspect()
    require(current['Id'] == before['Id'] and current['Image'] == OLD_IMAGE and mounts(current) == mounts(before), 'Live website changed during preparation; switch stopped')
    require(json.loads(run(compose + ['config', '--format', 'json'])) == original_model, 'Existing configuration changed during preparation')
    up = ['up', '-d', '--no-build', '--pull', 'never', '--no-deps', '--wait', '--wait-timeout', '180', SERVICE]
    try:
        run(candidate_command + up)
        after = inspect()
        require(after['Image'] == image, 'Candidate image was not selected')
        require(after['State'].get('Health', {}).get('Status') == 'healthy', 'Candidate is not healthy')
        require(mounts(after) == mounts(before), 'Website mounts changed')
        require(sorted(after['Config']['Env']) == sorted(before['Config']['Env']), 'Website environment changed')
        require(set(after['NetworkSettings']['Networks']) == set(before['NetworkSettings']['Networks']), 'Website networks changed')
        http_check(SERVICE)
        with urllib.request.urlopen('https://v79sl.com/faq', timeout=20) as response:
            public = response.read(1_000_000).decode('utf-8')
        require('AI &amp; Business Technology FAQ' in public and len(re.findall('<section id="q[0-9]+">', public)) == 10, 'Public FAQ verification failed')
    except BaseException:
        try:
            run(compose + ['-f', str(rollback)] + up)
            restored = inspect()
            require(restored['Image'] == OLD_IMAGE and restored['State'].get('Health', {}).get('Status') == 'healthy' and mounts(restored) == mounts(before), 'Restore verification failed')
            print('FAQ_RESTORE=PASS_PREVIOUS_NEWSLETTER_IMAGE_HEALTHY', flush=True)
        except BaseException:
            print('FAQ_RESTORE=FAILED_MANUAL_ATTENTION_REQUIRED; RELEASE=' + str(release), flush=True)
        raise
    (release / 'receipt.json').write_text(json.dumps({'revision': args.revision, 'previous_image': OLD_IMAGE, 'image': image, 'config': str(override), 'status': 'pass'}, indent=2))
    print('FAQ_RELEASE=PASS\nNEWSLETTER_RUNTIME_DEPENDENCIES=PRESERVED\nDATA_MOUNTS=PRESERVED\nPUBLIC_FAQ=https://v79sl.com/faq\nREVISION=' + args.revision + '\nIMAGE=' + image + '\nRELEASE=' + str(release), flush=True)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP: ' + str(error), file=sys.stderr)
        sys.exit(1)
