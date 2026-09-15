const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const props = [
  'main=appinventor.ai_phumsocool.VibeBooks.Screen1',
  'name=VibeBooks',
  'assets=../assets',
  'source=../src',
  'build=../build',
  'versioncode=1',
  'versionname=1.0',
  'useslocation=False',
  'aname=VibeBooks PRO',
  ''
].join('\n');

const scmObject = {
  "$Components": [
    {
      "$Name": "WebViewer1",
      "$Type": "WebViewer",
      "$Version": "11",
      "HomeUrl": "https://vibebooks.vercel.app",
      "Height": "-2",
      "Width": "-2",
      "IgnoreSslErrors": "False",
      "UsesLocation": "False",
      "Uuid": "101"
    }
  ],
  "$Parameters": [
    { "$Name": "AppName", "$Type": "string", "$Value": "VibeBooks PRO" },
    { "$Name": "Title", "$Type": "string", "$Value": "VibeBooks PRO" },
    { "$Name": "ShowListsAsJson", "$Type": "boolean", "$Value": "True" },
    { "$Name": "ScreenOrientation", "$Type": "string", "$Value": "portrait" },
    { "$Name": "Scrollable", "$Type": "boolean", "$Value": "False" },
    { "$Name": "Theme", "$Type": "string", "$Value": "AppTheme.Light.DarkActionBar" },
    { "$Name": "VersionCode", "$Type": "number", "$Value": "1" },
    { "$Name": "VersionName", "$Type": "string", "$Value": "1.0" }
  ],
  "$Version": "32"
};

const scmContent = '#| $JSON\n' + JSON.stringify(scmObject) + '\n|#\n';

const bkyContent = `<xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="component_event" id="Screen1_BackPressed" x="20" y="20">
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
</xml>
`;

const iconPath = path.join(__dirname, '..', 'design_stitch', 'vibebooks_brand_logo', 'screen.png');
const iconBuf = fs.readFileSync(iconPath);

const zip = new AdmZip();
zip.addFile('youngandroidproject/project.properties', Buffer.from(props, 'utf8'));
zip.addFile('src/appinventor/ai_phumsocool/VibeBooks/Screen1.scm', Buffer.from(scmContent, 'utf8'));
zip.addFile('src/appinventor/ai_phumsocool/VibeBooks/Screen1.bky', Buffer.from(bkyContent, 'utf8'));
zip.addFile('assets/icon.png', iconBuf);

const targetAia = path.join(__dirname, '..', 'VibeBooks_MIT_App.aia');
zip.writeZip(targetAia);
console.log('Successfully repacked VibeBooks_MIT_App.aia to:', targetAia);

const destArtifact = 'C:\\Users\\Phums\\.gemini\\antigravity\\brain\\945d18b5-9396-4cd8-a2a5-05278713ecb8\\VibeBooks_MIT_App.aia';
fs.copyFileSync(targetAia, destArtifact);
console.log('Copied to artifact dir:', destArtifact);

const downloadAia = 'C:\\Users\\Phums\\Downloads\\VibeBooks_MIT_App.aia';
fs.copyFileSync(targetAia, downloadAia);
console.log('Copied directly to Downloads folder:', downloadAia);
