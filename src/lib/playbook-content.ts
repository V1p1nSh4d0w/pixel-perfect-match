import type { CheckupItem } from "@/lib/checkup-results";

export type PlaybookSection = "WHERE TO FIND IT" | "WHAT TO CHANGE" | "VERIFY" | "KEEP IT CURRENT";

export interface CheckupPlaybookStep {
  section: PlaybookSection;
  text: string;
  time: string;
  tool: string;
}

type CheckupItemContent = Pick<CheckupItem, "id" | "title" | "category" | "where" | "review">;

interface RemediationContent {
  where?: string;
  action?: string;
  verify?: string;
  recommendation?: string;
}

/** Finding-specific guidance for checks where a generic location or verification would be misleading. */
const REMEDIATION_CONTENT: Record<string, RemediationContent> = {
  "personal_android:accessibility": {
    recommendation: "Keep accessibility access enabled only for services you recognise and intentionally use.",
    where: "Android: Settings → Accessibility → Downloaded apps or Installed services. Names can vary by Android version and phone maker.",
    action: "Review each listed service. Keep tools you recognise and rely on, such as a screen reader. Turn off access for anything unfamiliar or no longer needed.",
    verify: "Reopen Downloaded apps or Installed services. The service you disabled should show Off and should no longer have accessibility access. If you cannot identify a service, leave it on until you can check its purpose.",
  },
  "personal_android:device-admin": {
    recommendation: "Limit device-administrator control to apps you deliberately rely on.",
    where: "Android: Settings → Security or Security & privacy → More security settings → Device admin apps. The wording and menu location vary by phone maker.",
    action: "Keep Find My Device and work-management apps you recognise. Deactivate administrator access for apps you do not recognise or no longer need; check the app before uninstalling it.",
    verify: "Reopen Device admin apps and confirm the unwanted app is no longer active as an administrator. Leave expected Find My Device or work apps enabled.",
  },
  "personal_android:notification-access": {
    recommendation: "Allow notification reading only for apps that need it for a feature you use.",
    where: "Android: Settings → Apps → Special app access → Notification access. Some phones place it under Notifications → Device & app notifications.",
    action: "Keep access for services such as a smartwatch companion that you use. Turn it off for apps you do not recognise or that have no clear reason to read notifications.",
    verify: "Reopen Notification access and confirm the unwanted app is switched off while the companion apps you rely on remain enabled.",
  },
  "personal_android:overlay": {
    recommendation: "Keep screen-overlay access limited to apps with a feature you recognise and need.",
    where: "Android: Settings → Apps → Special app access → Display over other apps. Menu names vary by phone maker.",
    action: "Review the allowed list. Keep chat bubbles or screen filters you deliberately use; switch off access for unfamiliar apps or apps with no reason to appear over other screens.",
    verify: "Reopen Display over other apps and confirm the unwanted app is set to Not allowed. Confirm any overlay app you depend on remains allowed.",
  },
  "personal_android:unknown-apps": {
    recommendation: "Prevent apps you do not trust from installing apps outside an official store.",
    where: "Android: Settings → Apps → Special app access → Install unknown apps. On some phones, search Settings for “Install unknown apps.”",
    action: "Open each listed source app and set Allow from this source to Off unless you deliberately use it to install apps from a source you trust. You can enable it temporarily when needed and turn it off again afterward.",
    verify: "Reopen Install unknown apps and confirm Allow from this source is Off for browsers, file managers and chat apps you do not use to install apps.",
  },
  "personal_android:special-access": {
    recommendation: "Keep unusual app permissions only where the app has a clear feature that needs them.",
    where: "Android: Settings → Apps → Special app access. Open each access type, such as Usage access, Modify system settings or All files access. Labels vary by phone maker.",
    action: "Review apps under each access type. Keep access for apps whose feature you recognise and use; switch off access you did not intend to grant or that an app does not need.",
    verify: "Reopen each access type you changed and confirm the app is no longer listed as Allowed. Leave expected tools enabled when their feature depends on it.",
  },
  "personal_android:vpn": {
    recommendation: "Keep only VPN connections you chose or your workplace requires.",
    where: "Android: Settings → Network & internet → VPN. Samsung phones commonly use Settings → Connections → More connection settings → VPN.",
    action: "Remove a VPN you cannot identify or did not choose. Keep a trusted personal or work VPN. Turn off Always-on VPN unless you intentionally rely on that connection.",
    verify: "Reopen VPN settings and confirm the unfamiliar connection is gone and Always-on is off unless you deliberately use it. Check that a required work VPN remains available.",
  },
  "personal_android:private-dns": {
    recommendation: "Use Automatic or a Private DNS provider you deliberately selected.",
    where: "Android: Settings → Network & internet → Private DNS. Samsung: Settings → Connections → More connection settings → Private DNS.",
    action: "If the provider hostname is unfamiliar, choose Automatic. Keep a provider such as dns.google or one.one.one.one only if you selected it.",
    verify: "Reopen Private DNS and confirm Automatic is selected, or confirm the hostname matches the provider you intended to use.",
  },
  "personal_android:certificates": {
    recommendation: "Remove user-installed certificates only when you cannot verify their source or purpose.",
    where: "Android: Settings → Security & privacy → More security settings → Encryption & credentials → User credentials. Some phones show the list under Trusted credentials → User.",
    action: "If a certificate is unfamiliar and the phone is not managed by work or school, check with the person or organisation that added it before removing it. Keep certificates installed by your employer or school when expected.",
    verify: "Reopen User credentials and confirm the certificate you chose to remove is no longer listed. If its owner remains unknown, leave it as Worth reviewing and ask a trusted support person.",
  },
  "personal_android:dev-options": {
    recommendation: "Turn off Developer options when you do not use them to test or build apps.",
    where: "Android: Settings → System → Developer options. On some phones, search Settings for Developer options; the menu appears only after it has been enabled.",
    action: "If you do not use development tools, switch Developer options off using the control at the top of the page. If you do, leave only the features you need enabled.",
    verify: "Reopen Developer options and confirm the top-level switch is Off. The menu may disappear from Settings when disabled.",
  },
  "personal_android:usb-debugging": {
    recommendation: "Keep USB debugging off unless you are actively developing or testing apps.",
    where: "Android: Settings → System → Developer options → USB debugging. The labels may vary; if Developer options is not visible, USB debugging is generally off.",
    action: "Switch USB debugging off when you are not using a trusted computer for app development. Do not approve debugging access from a computer you do not recognise.",
    verify: "Reopen Developer options and confirm the USB debugging switch is Off. If prompted, revoke debugging authorisations for computers you no longer use.",
  },
  "personal_android:perm-camera": {
    recommendation: "Give camera access only to apps that need it for a feature you use.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → Camera. Older versions may show Settings → Privacy → Permission manager.",
    action: "For each app, choose Ask every time or Don't allow if camera access is not needed. Keep access for camera, video-call or scanning apps you use.",
    verify: "Reopen Camera permissions and confirm each app you changed now shows Ask every time or Not allowed, while apps you use for calls or photos still have the access they need.",
  },
  "personal_android:perm-mic": {
    recommendation: "Allow microphone access only for apps that need it for calls, recording or voice features you use.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → Microphone. Labels vary by Android version and phone maker.",
    action: "Set unnecessary apps to Ask every time or Don't allow. Keep access for calling, voice-note and assistant apps you recognise and use.",
    verify: "Reopen Microphone permissions and confirm the apps you changed are no longer set to Allowed, while the calling or recording apps you rely on still work.",
  },
  "personal_android:perm-location": {
    recommendation: "Limit location access to the apps and times that need it.",
    where: "Android: Settings → Location → App location permissions. Some versions show Settings → Privacy → Permission manager → Location.",
    action: "Change Allow all the time to Allow only while using the app unless continuous location is essential. Set access to Ask every time or Don't allow for apps that do not need your location.",
    verify: "Reopen App location permissions and confirm unnecessary apps are not set to Allow all the time. Check that maps or safety features you rely on still have suitable access.",
  },
  "personal_android:perm-contacts": {
    recommendation: "Share your contacts only with apps that need them for a feature you use.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → Contacts. Older versions may show this under Settings → Privacy.",
    action: "Choose Don't allow for apps that do not need your address book. Keep access for contacts, messaging or calling apps whose features depend on it.",
    verify: "Reopen Contacts permissions and confirm the unnecessary apps show Not allowed. Confirm your contacts or messaging app still has access if needed.",
  },
  "personal_android:perm-sms": {
    recommendation: "Keep SMS and call-log access limited to your phone and messaging apps and other apps that clearly need it.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → SMS, Call logs or Phone. Menu labels vary by phone maker.",
    action: "Remove SMS or call-log access from apps that do not need it. Keep it for your chosen phone and messaging apps; check with your carrier or work administrator before changing managed apps.",
    verify: "Reopen each SMS, Call logs and Phone permission list and confirm unrelated apps show Not allowed. Your chosen messaging and phone apps should remain permitted.",
  },
  "personal_android:perm-files": {
    recommendation: "Give apps access only to the photos and files they need.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → Photos and videos or Files. Names vary by Android version.",
    action: "Choose limited photo access, selected files, or Don't allow for apps that do not need broad access. Keep full access only for apps whose purpose requires it and that you trust.",
    verify: "Reopen the Photos and videos or Files permission list and confirm the app now has limited or no access. Open the app to check that its needed feature still works.",
  },
  "personal_android:perm-nearby": {
    recommendation: "Allow nearby-device access only for apps that connect to accessories you use.",
    where: "Android: Settings → Security & privacy → Privacy → Permission manager → Nearby devices. Some phones place it under Connected devices or Apps.",
    action: "Turn off access for apps that do not connect to a device you use. Keep it for trusted watch, headphone, car or casting apps that need it.",
    verify: "Reopen Nearby devices permissions and confirm the apps you changed are Not allowed. Check that the accessories you rely on still connect.",
  },
  "personal_android:apps-unknown": {
    recommendation: "Remove apps you cannot identify or no longer need after checking what they are.",
    where: "Android: Settings → Apps → See all apps. On some phones, sort by recently installed or search Settings for Apps.",
    action: "Search the app name and publisher before uninstalling; system and phone-maker apps can have unfamiliar names. Uninstall only apps you have identified and do not need.",
    verify: "Reopen See all apps and confirm the unwanted app is no longer listed. If it is a system or work app, leave it in place until its purpose is confirmed.",
  },
  "personal_android:apps-recent": {
    recommendation: "Identify recent installs you did not expect and remove only those you confirm are unwanted.",
    where: "Google Play Store → profile picture → Manage apps & device → Manage; sort by Recently updated. Some phones also show app install details under Settings → Apps.",
    action: "Check each recent install against your own activity or ask the person who uses the phone. Uninstall only apps you confirm are not needed or trusted.",
    verify: "Recheck the recent-app list and confirm the app you removed is gone. If an install is still unexplained, leave the finding as Worth reviewing until you identify its source.",
  },
  "personal_android:apps-sideloaded": {
    recommendation: "Keep apps from outside trusted stores only when you can verify their source and purpose.",
    where: "Android: Settings → Apps → select an app → App details or App installed from. Google Play Store → profile picture → Play Protect can scan installed apps.",
    action: "Confirm who published each app installed from a browser, file manager or chat app. Run a Play Protect scan and uninstall apps whose source you cannot verify or no longer need.",
    verify: "Check the app's installed-from details and Play Protect results. Confirm unwanted apps are removed and do not reopen files or links that installed them.",
  },
  "personal_android:apps-powerful": {
    recommendation: "Match each app's permissions to the feature you use it for.",
    where: "Android: Settings → Apps → select an app → Permissions. For special access such as Accessibility or SMS, use Settings → Apps → Special app access.",
    action: "For simple apps such as flashlights or wallpaper tools, remove permissions they do not need. Uninstall an app only after confirming you do not rely on it; keep permissions needed by trusted features.",
    verify: "Reopen the app's Permissions page and confirm unnecessary permissions show Not allowed. Open the app and make sure the feature you use still works.",
  },
  "personal_windows:defender": {
    recommendation: "Keep one trusted security product active and current on your PC.",
    action: "If Windows Security shows a warning, read its message and follow the recommended action. If you chose another antivirus, confirm that product is active and updated before changing Defender settings.",
    verify: "Reopen Windows Security → Virus & threat protection. Confirm the chosen security product shows active protection and no unresolved warning.",
  },
  "personal_windows:realtime": {
    recommendation: "Keep real-time protection on unless another trusted antivirus is providing it.",
    action: "In Manage settings, switch Real-time protection on if it is off and you do not use another antivirus. If another product is active, check its status instead of turning on conflicting protection.",
    verify: "Reopen Virus & threat protection → Manage settings and confirm Real-time protection is On, or confirm your chosen antivirus reports active protection.",
  },
  "personal_windows:firewall": {
    recommendation: "Keep the firewall active for the network your PC is using.",
    action: "Open the active network profile and turn on Microsoft Defender Firewall if it is off and no trusted firewall replaces it. Allow a specific app when needed instead of disabling the firewall.",
    verify: "Reopen Firewall & network protection and confirm the active profile shows Firewall is on.",
  },
  "personal_windows:smartscreen": {
    recommendation: "Use Windows reputation checks to warn about unfamiliar apps and files.",
    action: "Turn on Check apps and files and SmartScreen for Microsoft Edge unless you have a specific compatibility reason to leave one off.",
    verify: "Reopen Reputation-based protection settings and confirm Check apps and files and SmartScreen for Microsoft Edge are On.",
  },
  "personal_windows:pua": {
    recommendation: "Let Windows block apps it identifies as potentially unwanted.",
    action: "Turn on potentially unwanted app blocking. If a trusted app is blocked, review the warning and allow only that specific app rather than switching protection off globally.",
    verify: "Reopen Potentially unwanted app blocking and confirm both app blocking and download blocking show On, if those options are available.",
  },
  "personal_windows:uac": {
    recommendation: "Keep User Account Control set to notify before apps make system changes.",
    action: "Move the slider to the Windows default or higher. Do not choose Never notify; the prompt helps stop unapproved changes.",
    verify: "Reopen Change User Account Control settings and confirm the slider is at the default level (second from the top) or higher.",
  },
  "personal_windows:secure-boot": {
    recommendation: "Use Secure Boot when your PC supports it and Windows is configured to start securely.",
    action: "If System Information shows Off, check the PC maker's instructions before changing firmware. Do not change boot settings if you rely on disk encryption or are unsure; older PCs may not support Secure Boot.",
    verify: "Reopen System Information and confirm Secure Boot State says On. If it says Unsupported, record that the device does not offer this setting.",
  },
  "personal_windows:tpm": {
    recommendation: "Confirm whether your PC has a ready TPM before relying on hardware security features.",
    action: "If no TPM is listed, check the PC maker's documentation or ask a trusted technician whether the device supports one. Do not change firmware settings without guidance.",
    verify: "Open Windows Security → Device security → Security processor details, or run tpm.msc, and confirm the TPM is present and ready. If unsupported, leave it as Worth reviewing rather than changing firmware blindly.",
  },
  "personal_windows:encryption": {
    recommendation: "Encrypt the PC's drive when supported, and keep its recovery key somewhere safe.",
    action: "Before enabling Device encryption or BitLocker, save the recovery key in a secure place you can reach if the PC fails. Then turn encryption on if the device supports it.",
    verify: "Reopen Device encryption or BitLocker and confirm the drive shows encrypted or protection on. Confirm the recovery key is stored safely without entering it into SecureCheck.",
  },
  "personal_windows:memory-integrity": {
    recommendation: "Use Memory Integrity when compatible drivers allow it.",
    action: "If Memory Integrity is off, try turning it on. If Windows lists incompatible drivers, update or remove a driver only when you know it is safe; it is reasonable to leave the feature off until compatibility is resolved.",
    verify: "Reopen Core isolation details and confirm Memory Integrity is On. If Windows still reports incompatible drivers, keep the finding as Worth reviewing until those drivers are addressed.",
  },
  "personal_windows:rdp": {
    recommendation: "Turn off Remote Desktop if you do not use it to connect to this PC.",
    action: "Switch Remote Desktop off when it is not needed. If you rely on it, keep it on only for expected users and protect their sign-in with a strong password and MFA where available.",
    verify: "Reopen Settings → System → Remote Desktop and confirm it is Off unless you intentionally use it. If enabled, check the allowed users list for people you recognise.",
  },
  "personal_windows:remote-assist": {
    recommendation: "Allow Remote Assistance only when you intentionally use it with someone you trust.",
    action: "Untick Allow Remote Assistance connections if you do not use the feature. Never grant access to someone who contacted you unexpectedly.",
    verify: "Reopen the Remote tab in System Properties and confirm Allow Remote Assistance connections is unchecked unless you deliberately need it.",
  },
  "personal_windows:remote-tools": {
    recommendation: "Keep remote-access apps only when you know who installed them and why they are needed.",
    action: "Check the publisher and ask anyone who uses the PC about unfamiliar tools such as AnyDesk or TeamViewer. Remove only tools you confirm are unneeded; close a session if an unexpected caller asked you to install it.",
    verify: "Reopen Installed apps and confirm the unwanted tool is gone. If a trusted support provider needs it, confirm the provider and account before keeping it.",
  },
  "personal_windows:admins": {
    recommendation: "Keep administrator accounts limited to people who manage the PC.",
    action: "Identify who each administrator account belongs to before changing it. Use a standard account for routine work where practical, but keep at least one administrator account you control.",
    verify: "Reopen the account list and confirm each remaining administrator is recognised and needed. Keep unexplained accounts as Worth reviewing until their owner is confirmed.",
  },
  "personal_windows:unknown-accounts": {
    recommendation: "Remove only accounts you have confirmed nobody needs.",
    action: "Ask other people who use the PC and check whether an unfamiliar account belongs to a family member or work tool. Remove an account only after confirming its owner and backing up any needed files.",
    verify: "Reopen Settings → Accounts → Other users and confirm the account you intentionally removed is gone. Confirm the expected users can still sign in.",
  },
  "personal_windows:extra-admins": {
    recommendation: "Use standard accounts for people who do not need to manage the PC.",
    action: "Select the account, choose Change account type, and set it to Standard user if administrator rights are unnecessary. Keep at least one administrator account you control.",
    verify: "Reopen Change account type and confirm the account now says Standard User, while your own administrator account remains available.",
  },
  "personal_windows:startup": {
    recommendation: "Start only the apps you need automatically when you sign in.",
    action: "Look up unfamiliar entries first. Turn off startup for apps you recognise but do not need running at sign-in; do not disable security or device-driver tools unless you know their purpose.",
    verify: "Reopen Startup apps and confirm the chosen apps show Off. Restart or sign in again to check that essential apps still work.",
  },
  "personal_windows:installed": {
    recommendation: "Remove apps you have identified as unnecessary or untrusted.",
    action: "Search the app name and publisher before uninstalling because some unfamiliar apps come from the PC maker. Uninstall only apps you confirm you do not need.",
    verify: "Reopen Installed apps and confirm the app you removed no longer appears. If it remains or its purpose is unclear, leave it as Worth reviewing.",
  },
  "personal_windows:recent-apps": {
    recommendation: "Identify unexpected recent installs and remove only those you confirm are unwanted.",
    action: "Sort Installed apps by install date and check whether you or another PC user installed each recent app. Search unfamiliar publishers before uninstalling.",
    verify: "Recheck the recently installed list and confirm the unwanted app is no longer present. If you cannot identify who installed an app, keep it as Worth reviewing.",
  },
  "personal_windows:background": {
    recommendation: "Stop or remove background apps only after confirming what they do.",
    action: "Use Task Manager to identify an unfamiliar process by its name and publisher before ending it. Remove software only after confirming it is not a Windows, driver, security or work tool you need.",
    verify: "After removing an unneeded app, reopen Task Manager and confirm its process no longer appears after restart. If it returns, check its publisher and startup entry before acting again.",
  },
  "personal_windows:extensions": {
    recommendation: "Keep only browser extensions you recognise and still use.",
    action: "Check each extension's name and publisher. Remove add-ons you cannot identify or no longer need; keep ones you chose and trust.",
    verify: "Reopen the extensions page and confirm the unwanted add-on is gone. Check that the browser still works as expected.",
  },
  "personal_windows:ext-perms": {
    recommendation: "Limit extension access to the sites and activity it actually needs.",
    action: "For extensions with broad access, choose On click or specific sites where available. Remove an extension if its purpose does not justify reading and changing data on every site.",
    verify: "Reopen the extension's Details or Permissions page and confirm site access is limited as intended. If broad access remains necessary but you cannot verify why, keep the finding as Worth reviewing.",
  },
  "personal_windows:notifications": {
    recommendation: "Allow website notifications only from sites you recognise and want updates from.",
    action: "Under Allowed, remove sites you do not recognise or no longer want notifications from. Leave trusted sites you actively use.",
    verify: "Reopen the browser's notification Allowed list and confirm the removed sites are no longer listed.",
  },
  "personal_windows:popups": {
    recommendation: "Block pop-ups by default and allow them only for trusted sites that need them.",
    action: "Set the default to Block. Remove unfamiliar sites from Allowed; add an exception only when a trusted service requires it.",
    verify: "Reopen Pop-ups and redirects settings and confirm the default is Block and only expected sites appear in Allowed.",
  },
  "personal_windows:downloads": {
    recommendation: "Review downloads before opening them, especially files you did not expect.",
    action: "Turn on Ask where to save each file if your browser offers it. Cancel downloads you did not request and do not override browser warnings for unfamiliar files.",
    verify: "Reopen the browser's Downloads settings and confirm the save prompt is enabled where available. Check that unexpected downloads are not left open or running.",
  },
  "personal_windows:browser-security": {
    recommendation: "Keep the browser's built-in protection enabled and the browser updated.",
    action: "Use at least Standard or Balanced protection in the browser's security settings. Install browser updates through its About page or official update mechanism.",
    verify: "Reopen the Security settings and confirm protection is at Standard/Balanced or stronger. Check the browser's About page for a current version or successful update.",
  },
  "Suspicious links": {
    where: "In the message, email, text or webpage containing the link. On a computer, hover over it without clicking; on a phone, press and hold to preview its destination.",
    action: "Do not open an unexpected link. Compare its real domain with an address you already trust. If unsure, open the organisation's official website or app directly.",
    verify: "For future unexpected links, check the destination before opening it and use the official website or app whenever the address is uncertain.",
    recommendation: "Check unexpected links before opening them, and use the official site or app when unsure.",
  },
  "Fake CAPTCHA instructions": {
    where: "On the webpage showing the CAPTCHA or instructions. There is no device setting to change for this situation.",
    action: "Do not paste commands, open Run or Terminal, or install anything the page requests. Close the tab. If you already followed the instructions, disconnect from the site and ask a trusted support person to check the device.",
    verify: "Confirm you did not run a command or install a file from the page. If you did, keep this as Worth reviewing until the device has been checked.",
    recommendation: "Never run commands or install files requested by an unexpected CAPTCHA page.",
  },
  "Browser extensions": {
    where: "Chrome: ⋮ → Extensions → Manage extensions (or chrome://extensions). Edge: … → Extensions → Manage extensions. Firefox: ☰ → Add-ons and themes → Extensions. Safari: Safari → Settings → Extensions.",
    action: "Search for extensions you do not recognise before removing them. Remove extensions you cannot identify or no longer need; keep only ones you chose and trust.",
    verify: "Reopen the extensions list and confirm the unwanted add-ons are gone. Check that the browser still works as expected.",
    recommendation: "Keep only browser extensions you recognise, trust and still use.",
  },
  "Extensions with broad permissions": {
    where: "Open each browser's extensions page, choose Details for an extension, then review Site access or Permissions. Chrome: chrome://extensions. Edge: edge://extensions. Firefox: about:addons.",
    action: "Limit site access to specific sites or On click when available. Remove an extension if broad access is unnecessary or you cannot confirm why it needs it.",
    verify: "Return to each extension's Details page and confirm its site access matches the sites it needs. Keep it as Worth reviewing if the reason for broad access is unclear.",
    recommendation: "Limit extensions to the sites they need, and remove ones with unexplained broad access.",
  },
  "Website notification permissions": {
    where: "Chrome: ⋮ → Settings → Privacy and security → Site settings → Notifications. Edge: … → Settings → Cookies and site permissions → Notifications. Firefox: ☰ → Settings → Privacy & Security → Permissions → Notifications. Safari on Mac: Safari → Settings → Websites → Notifications.",
    action: "Under Allowed, remove websites you do not recognise or no longer want to hear from. Leave notification access on only for sites you trust and use.",
    verify: "Reopen the Allowed list and confirm the unwanted websites are no longer listed. Keep it as Worth reviewing if you cannot identify a site's owner.",
    recommendation: "Remove notification permission for websites you do not recognise or need.",
  },
  "Security protection (antivirus) on business computers": {
    where: "Windows: Start → Windows Security → Virus & threat protection. Mac: Apple menu → System Settings → General → Software Update to check macOS updates; review any separate security app directly.",
    action: "Confirm protection is turned on and its last update is current on each business computer. Follow the security product's own warning or recovery guidance; do not install a second product just to clear a warning.",
    verify: "Reopen the security app on each computer and check that protection is active with no unresolved warning. Keep it as Worth reviewing if a device or its security status cannot be checked.",
    recommendation: "Keep trusted security protection active and up to date on each business computer.",
  },
  "A business device firewall needs review": {
    where: "Windows: Start → Windows Security → Firewall & network protection. Mac: Apple menu → System Settings → Network → Firewall.",
    action: "Turn on the built-in firewall for each business computer. If a work app needs a connection, allow that app specifically instead of turning the firewall off.",
    verify: "Reopen the firewall page and confirm it is on for the active network. Keep it as Worth reviewing if the setting is managed by your organisation or IT provider.",
    recommendation: "Turn on the built-in firewall for each business computer.",
  },
  "Encryption on business devices needs review": {
    where: "Windows: Settings → Privacy & security → Device encryption, or Windows Security → Device encryption/BitLocker. Mac: Apple menu → System Settings → Privacy & Security → FileVault.",
    action: "Enable encryption on supported devices that hold business data. Store the recovery key in an approved secure location; never share it in this checkup.",
    verify: "Return to the encryption page and confirm encryption is on. Confirm the recovery key is stored securely without copying it into this checkup. Keep it as Worth reviewing if encryption is unavailable or the key cannot be accounted for.",
    recommendation: "Encrypt supported devices that store business data and protect their recovery keys.",
  },
  "Remote access": {
    where: "Windows: Settings → System → Remote Desktop, and Settings → Apps → Installed apps for remote-support tools. Mac: System Settings → General → Sharing; review Screen Sharing, Remote Login and Remote Management.",
    action: "Turn off remote access you do not use. For access you need, keep only approved tools and users, require strong sign-in and MFA, and confirm with your IT provider before removing managed software.",
    verify: "Reopen the remote-access settings and confirm unused options are off and required tools have named, authorised users. Keep it as Worth reviewing if you cannot identify a tool or its owner.",
    recommendation: "Disable unused remote access and protect any required access with strong sign-in.",
  },
  "Remote access on business devices needs review": {
    where: "Windows: Settings → System → Remote Desktop, and Settings → Apps → Installed apps for remote-support tools. Mac: System Settings → General → Sharing; review Screen Sharing, Remote Login and Remote Management.",
    action: "Turn off remote access you do not use. For access you need, keep only approved tools and users, require strong sign-in and MFA, and confirm with your IT provider before removing managed software.",
    verify: "Reopen the remote-access settings and confirm unused options are off and required tools have named, authorised users. Keep it as Worth reviewing if you cannot identify a tool or its owner.",
    recommendation: "Disable unused remote access and protect any required access with strong sign-in.",
  },
  "Unfamiliar or unnecessary software": {
    where: "Windows: Settings → Apps → Installed apps; sort by install date if available. Mac: Finder → Applications. Also check the installed-app list in any device-management console you use.",
    action: "Look up the app name and publisher before acting; some unfamiliar names belong to the device maker. Remove only software you have confirmed is unneeded or unapproved, and ask your IT provider before removing managed tools.",
    verify: "Recheck the installed-app list and confirm the unwanted program is gone. Keep it as Worth reviewing if you cannot identify the app or confirm its owner.",
    recommendation: "Identify unfamiliar software first, then remove only apps confirmed to be unnecessary or unapproved.",
  },
  "Unfamiliar or unnecessary business software needs review": {
    where: "Windows: Settings → Apps → Installed apps; sort by install date if available. Mac: Finder → Applications. Also check any device-management console you use.",
    action: "Look up the app name and publisher before acting; some unfamiliar names belong to the device maker. Remove only software you have confirmed is unneeded or unapproved, and ask your IT provider before removing managed tools.",
    verify: "Recheck the installed-app list and confirm the unwanted program is gone. Keep it as Worth reviewing if you cannot identify the app or confirm its owner.",
    recommendation: "Identify unfamiliar software first, then remove only apps confirmed to be unnecessary or unapproved.",
  },
  "Everyday administrator access needs review": {
    where: "Windows: Settings → Accounts → Other users; check which accounts are Administrators. Mac: System Settings → Users & Groups; inspect account types.",
    action: "Use standard accounts for routine work where practical. Remove administrator rights only from accounts that do not need them, and keep a separate administrator account available for maintenance.",
    verify: "Reopen the account list and confirm administrator access is limited to the people who maintain the device. Keep it as Worth reviewing if you cannot confirm who owns an account.",
    recommendation: "Reserve administrator access for people who need to manage the device.",
  },
  "MFA is not enabled on an important account": {
    action: "Enable two-step verification using an authenticator app, passkey or security key when offered. Save recovery codes in a private, secure place and never share them here.",
    verify: "Sign out and back in to confirm the account asks for the second factor. Keep it as Worth reviewing if you cannot test the sign-in or account recovery.",
    recommendation: "Add a second sign-in factor to important accounts, starting with email and banking.",
  },
  "MFA is not enabled for important business accounts": {
    action: "Enable multi-factor sign-in for important accounts, starting with email and administrator accounts. Prefer an authenticator app, passkey or security key, store recovery codes safely, and require it for staff where supported.",
    verify: "Test a fresh sign-in to confirm the second factor is required and confirm each important user is enrolled. Keep it as Worth reviewing if an account cannot be checked.",
    recommendation: "Require multi-factor sign-in on important business accounts, starting with email and admin access.",
  },
  "Administrator access needs review": {
    action: "Remove administrator rights from people who do not need them. Use a separate standard account for routine work where supported, and confirm an unfamiliar account with the service owner before removing it.",
    verify: "Reopen the user and role list and confirm only the people responsible for managing the service remain administrators. Keep it as Worth reviewing if an account or role is unexplained.",
    recommendation: "Keep administrator access only for people who need it to manage the service.",
  },
  "Business account recovery methods need review": {
    action: "Replace outdated or unrecognised recovery emails and phone numbers with details controlled by the business. Store backup codes securely and do not paste them into the checkup.",
    verify: "Reopen the recovery page and confirm every listed email and number is current and controlled by the business. Keep it as Worth reviewing if ownership is unclear.",
    recommendation: "Keep account recovery details current and under business control.",
  },
  "Connected business apps and services need review": {
    action: "Remove access for apps that are unused or no longer needed. For an unfamiliar connection, first confirm its owner and purpose with the service administrator.",
    verify: "Reopen the connected-app list and confirm removed apps are gone and remaining access has a known owner and purpose. Keep it as Worth reviewing if a connection is unexplained.",
    recommendation: "Remove unused app connections and confirm the purpose of unfamiliar ones.",
  },
};

function cleanInstruction(value: string) {
  return value.replace(/^(Recommended improvement:|Access should be reviewed:|Potential warning sign\.|Verify before continuing\.|Unexpected request\.)\s*/i, "").trim();
}

export function getCheckupPlaybookContent(item: CheckupItemContent, findingTitle?: string) {
  const androidCategories = new Set(["Powerful access", "Network & system configuration", "App permissions", "Installed apps"]);
  const windowsCategories = new Set(["Windows Security", "System protection", "Remote access", "Accounts & privileges", "Applications & startup", "Browser security"]);
  const family = androidCategories.has(item.category) ? "personal_android"
    : windowsCategories.has(item.category) ? "personal_windows"
      : item.category === "Accounts & Access" ? "business_access"
        : item.category === "Devices & Software" ? "business_devices"
          : item.category === "Data & Backups" ? "business_data"
            : item.category === "Email, Website & Online Presence" ? "business_online"
              : item.category === "Core warning signs" || item.category === "Links, pages & pop-ups" ? "personal_scam"
                : undefined;
  const curated = REMEDIATION_CONTENT[`${item.category}:${item.id}`]
    || (family ? REMEDIATION_CONTENT[`${family}:${item.id}`] : undefined)
    || (findingTitle && REMEDIATION_CONTENT[findingTitle])
    || REMEDIATION_CONTENT[item.title];
  const where = curated?.where ?? item.where?.trim();
  const action = curated?.action ?? (item.review ? cleanInstruction(item.review) : undefined);
  const steps: CheckupPlaybookStep[] = [];

  if (where) {
    steps.push({ section: "WHERE TO FIND IT", text: where, time: "~3 min", tool: item.category });
  }
  if (action) {
    steps.push({ section: "WHAT TO CHANGE", text: action, time: "Varies", tool: "Recommended action" });
  }
  if (curated?.verify) {
    steps.push({ section: "VERIFY", text: curated.verify, time: "~2 min", tool: "Check the setting or result" });
  }

  const recommendation = curated?.recommendation;
  return { steps, recommendation };
}

export function sectionForPlaybookText(text: string): PlaybookSection | undefined {
  const prefix = text.match(/^(Find it|Fix it|Verify it|Maintain it|Review it)\s*[—-]/i)?.[1]?.toLowerCase();
  if (prefix === "find it") return "WHERE TO FIND IT";
  if (prefix === "fix it") return "WHAT TO CHANGE";
  if (prefix === "verify it") return "VERIFY";
  if (prefix === "maintain it" || prefix === "review it") return "KEEP IT CURRENT";
  return undefined;
}

export function textWithoutPlaybookPrefix(text: string) {
  return text.replace(/^(?:Find it|Fix it|Verify it|Maintain it|Review it)\s*[—-]\s*/i, "");
}
