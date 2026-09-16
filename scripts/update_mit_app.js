const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const scmContent = JSON.stringify({
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
    },
    {
      "$Name": "ActivityStarter1",
      "$Type": "ActivityStarter",
      "$Version": "6",
      "Action": "android.intent.action.VIEW",
      "Uuid": "102"
    }
  ],
  "$Parameters": [
    { "$Name": "AppName", "$Type": "string", "$Value": "VibeBooks PRO" },
    { "$Name": "Title", "$Type": "string", "$Value": "VibeBooks PRO" },
    { "$Name": "ShowListsAsJson", "$Type": "boolean", "$Value": "True" },
    { "$Name": "ScreenOrientation", "$Type": "string", "$Value": "portrait" },
    { "$Name": "Scrollable", "$Type": "boolean", "$Value": "False" },
    { "$Name": "Theme", "$Type": "string", "$Value": "AppTheme.Light.DarkActionBar" },
    { "$Name": "VersionCode", "$Type": "number", "$Value": "2" },
    { "$Name": "VersionName", "$Type": "string", "$Value": "1.1" }
  ],
  "$Version": "32"
});

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

  <block type="component_event" id="WebViewer1_WebViewStringChange" x="20" y="220">
    <mutation component_type="WebViewer" is_generic="false" instance_name="WebViewer1" event_name="WebViewStringChange"></mutation>
    <field name="COMPONENT_SELECTOR">WebViewer1</field>
    <statement name="DO">
      <block type="controls_if" id="if_has_url">
        <value name="IF0">
          <block type="math_compare" id="compare_length">
            <field name="OP">GT</field>
            <value name="A">
              <block type="text_length" id="txt_len">
                <value name="VALUE">
                  <block type="component_set_get" id="get_wv_str">
                    <mutation component_type="WebViewer" set_or_get="get" property_name="WebViewString" is_generic="false" instance_name="WebViewer1"></mutation>
                    <field name="COMPONENT_SELECTOR">WebViewer1</field>
                    <field name="PROP">WebViewString</field>
                  </block>
                </value>
              </block>
            </value>
            <value name="B">
              <block type="math_number" id="num_zero">
                <field name="NUM">5</field>
              </block>
            </value>
          </block>
        </value>
        <statement name="DO0">
          <block type="component_set_get" id="set_action">
            <mutation component_type="ActivityStarter" set_or_get="set" property_name="Action" is_generic="false" instance_name="ActivityStarter1"></mutation>
            <field name="COMPONENT_SELECTOR">ActivityStarter1</field>
            <field name="PROP">Action</field>
            <value name="VALUE">
              <block type="text" id="act_view">
                <field name="TEXT">android.intent.action.VIEW</field>
              </block>
            </value>
            <next>
              <block type="component_set_get" id="set_uri">
                <mutation component_type="ActivityStarter" set_or_get="set" property_name="DataUri" is_generic="false" instance_name="ActivityStarter1"></mutation>
                <field name="COMPONENT_SELECTOR">ActivityStarter1</field>
                <field name="PROP">DataUri</field>
                <value name="VALUE">
                  <block type="component_set_get" id="get_uri_str">
                    <mutation component_type="WebViewer" set_or_get="get" property_name="WebViewString" is_generic="false" instance_name="WebViewer1"></mutation>
                    <field name="COMPONENT_SELECTOR">WebViewer1</field>
                    <field name="PROP">WebViewString</field>
                  </block>
                </value>
                <next>
                  <block type="component_method" id="call_start_act">
                    <mutation component_type="ActivityStarter" method_name="StartActivity" is_generic="false" instance_name="ActivityStarter1"></mutation>
                    <field name="COMPONENT_SELECTOR">ActivityStarter1</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`;

// Target AIA files to update
const targetPaths = [
  path.resolve('VibeBooks_MIT_App.aia'),
  path.resolve('C:/Users/Phums/.gemini/antigravity/brain/945d18b5-9396-4cd8-a2a5-05278713ecb8/VibeBooks_MIT_App.aia'),
  path.resolve('public/VibeBooks_MIT_App.aia')
];

for (const p of targetPaths) {
  try {
    let zip;
    if (fs.existsSync(p)) {
      zip = new AdmZip(p);
      console.log('Updating existing:', p);
    } else {
      zip = new AdmZip(targetPaths[0]);
      console.log('Creating from template:', p);
    }

    zip.updateFile('src/appinventor/ai_phumsocool/VibeBooks/Screen1.scm', Buffer.from(scmContent, 'utf8'));
    zip.updateFile('src/appinventor/ai_phumsocool/VibeBooks/Screen1.bky', Buffer.from(bkyContent, 'utf8'));
    zip.writeZip(p);
    console.log('Successfully written:', p);
  } catch (err) {
    console.error('Error on', p, err.message);
  }
}
