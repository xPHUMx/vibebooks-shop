const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function buildAia() {
  const baseDir = path.join(__dirname, '..', 'mit_app_inventor');
  const srcDir = path.join(baseDir, 'src', 'appinventor', 'ai_phumsocool', 'VibeBooks');
  const yaDir = path.join(baseDir, 'youngandroidproject');
  const assetsDir = path.join(baseDir, 'assets');

  [srcDir, yaDir, assetsDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // 1. project.properties
  const props = `main=appinventor.ai_phumsocool.VibeBooks.Screen1
name=VibeBooks
assets=../assets
source=../src
build=../build
versioncode=1
versionname=1.0
useslocation=False
`;
  fs.writeFileSync(path.join(yaDir, 'project.properties'), props, 'utf8');

  // 2. Screen1.scm (Components)
  const scm = `{"$Components":[{"$Name":"WebViewer1","$Type":"WebViewer","$Version":"11","HomeUrl":"https://vibebooks.vercel.app","Height":"-2","Width":"-2","IgnoreSslErrors":"False","UsesLocation":"False","Uuid":"101"}],"$Parameters":[{"$Name":"AppName","$Type":"string","$Value":"VibeBooks PRO"},{"$Name":"Title","$Type":"string","$Value":"VibeBooks PRO"},{"$Name":"ShowListsAsJson","$Type":"boolean","$Value":"True"},{"$Name":"ScreenOrientation","$Type":"string","$Value":"portrait"},{"$Name":"Scrollable","$Type":"boolean","$Value":"False"},{"$Name":"Theme","$Type":"string","$Value":"AppTheme.Light.DarkActionBar"},{"$Name":"VersionCode","$Type":"number","$Value":"1"},{"$Name":"VersionName","$Type":"string","$Value":"1.0"}],"$Version":"32"}`;
  fs.writeFileSync(path.join(srcDir, 'Screen1.scm'), scm, 'utf8');

  // 3. Screen1.bky (Blocks XML)
  const bky = `<xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="component_event" id="block_back" x="40" y="40">
    <mutation component_type="Form" is_generic="false" instance_name="Screen1" event_name="BackPressed"></mutation>
    <field name="COMPONENT_SELECTOR">Screen1</field>
    <statement name="DO">
      <block type="controls_if" id="if_can_go_back">
        <value name="IF0">
          <block type="component_method" id="call_can_go_back">
            <mutation component_type="WebViewer" method_name="CanGoBack" is_generic="false" instance_name="WebViewer1"></mutation>
            <field name="COMPONENT_SELECTOR">WebViewer1</field>
          </block>
        </value>
        <statement name="DO0">
          <block type="component_method" id="call_go_back">
            <mutation component_type="WebViewer" method_name="GoBack" is_generic="false" instance_name="WebViewer1"></mutation>
            <field name="COMPONENT_SELECTOR">WebViewer1</field>
          </block>
        </statement>
        <statement name="ELSE">
          <block type="controls_closeApplication" id="close_app"></block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;
  fs.writeFileSync(path.join(srcDir, 'Screen1.bky'), bky, 'utf8');

  // 4. App Icon
  const logoPath = path.join(__dirname, '..', 'design_stitch', 'vibebooks_brand_logo', 'screen.png');
  if (fs.existsSync(logoPath)) {
    fs.copyFileSync(logoPath, path.join(assetsDir, 'icon.png'));
  }

  // 5. Zip into temp .zip then rename to .aia
  const zipPath = path.join(__dirname, '..', 'VibeBooks_MIT_App.zip');
  const aiaPath = path.join(__dirname, '..', 'VibeBooks_MIT_App.aia');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  if (fs.existsSync(aiaPath)) fs.unlinkSync(aiaPath);

  const cmd = `Compress-Archive -Path "${baseDir}\\*" -DestinationPath "${zipPath}" -Force; Rename-Item -Path "${zipPath}" -NewName "${path.basename(aiaPath)}" -Force`;
  execSync(`powershell -Command "${cmd}"`);

  console.log('Successfully created MIT App Inventor AIA project:', aiaPath);
  
  // Also copy to artifacts directory for user direct access
  const artifactAia = 'C:\\Users\\Phums\\.gemini\antigravity\\brain\\945d18b5-9396-4cd8-a2a5-05278713ecb8\\VibeBooks_MIT_App.aia';
  fs.copyFileSync(aiaPath, artifactAia);
  console.log('Copied to artifacts directory:', artifactAia);
}

buildAia().catch(console.error);
