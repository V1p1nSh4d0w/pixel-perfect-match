// Guided self-check content for the Android Phone Security Check.
// The website cannot inspect the device; users check each setting and report back.

export type AndroidAnswer = "good" | "found" | "unsure";

export interface AndroidCheck {
  id: string;
  category: string;
  title: string;
  what: string;
  why: string;
  /** Short hint on what specifically deserves attention. */
  lookFor?: string;
  where: string;
  /** Guidance shown on the results page when the user reports something or is unsure. */
  review: string;
  quick: boolean;
}

const PA = "Powerful access";
const NET = "Network & system configuration";
const PERM = "App permissions";
const APPS = "Installed apps";

export const ANDROID_CHECKS: AndroidCheck[] = [
  {
    id: "accessibility", category: PA, quick: true,
    title: "Accessibility services", lookFor: "Look for apps you don't recognise, or apps you didn't intentionally give accessibility access to.",
    what: "Which apps are allowed to use accessibility services.",
    why: "Accessibility access lets an app read the screen and act on your behalf. Many legitimate apps (screen readers, password managers) use it, but it can also be misused.",
    where: "Settings → Accessibility → look under \"Downloaded apps\" or \"Installed services\".",
    review: "Look at each app listed. If you don't recognise it, don't need it, or don't remember turning it on, switch its access off. Keep access for apps you rely on.",
  },
  {
    id: "device-admin", category: PA, quick: true,
    title: "Device administrator apps", lookFor: "Look for apps you don't recognise or didn't set up yourself. Find My Device and work apps are common, expected entries.",
    what: "Which apps have device admin rights.",
    why: "Device admin apps can lock, wipe, or prevent their own removal. Find My Device and work profiles use this legitimately.",
    where: "Settings → Security (or Security & privacy) → More security settings → Device admin apps.",
    review: "Keep apps you recognise, such as Find My Device or your employer's work app. Deactivate any you don't recognise, then decide whether you still need the app itself.",
  },
  {
    id: "notification-access", category: PA, quick: false,
    title: "Notification access", lookFor: "Look for apps you don't recognise, or apps that have no clear reason to read your notifications.",
    what: "Which apps can read all your notifications.",
    why: "Notifications can contain messages and one-time login codes. Smartwatch and automation apps need this access legitimately.",
    where: "Settings → Apps → Special app access → Notification access (or Device & app notifications).",
    review: "Turn off access for apps you don't recognise or no longer use. Keep it for apps like your smartwatch companion if you use them.",
  },
  {
    id: "overlay", category: PA, quick: false,
    title: "Display over other apps", lookFor: "Look for unfamiliar apps, or apps that have no obvious reason to appear on top of other apps.",
    what: "Which apps can draw on top of other apps.",
    why: "Overlays are used by chat bubbles and screen filters, but can also be used to show fake login screens.",
    where: "Settings → Apps → Special app access → Display over other apps.",
    review: "Review the list and turn off apps you don't recognise or don't need floating over other apps.",
  },
  {
    id: "unknown-apps", category: PA, quick: true,
    title: "Install unknown apps", lookFor: "Look for apps set to \"Allowed\" that you don't use to install apps on purpose.",
    what: "Which apps are allowed to install other apps.",
    why: "Apps with this permission (browsers, file managers, chat apps) can install apps from outside the Play Store, a common route for harmful apps.",
    where: "Settings → Apps → Special app access → Install unknown apps.",
    review: "Set apps to \"Not allowed\" unless you deliberately install apps from that source. You can turn it back on temporarily when you need it.",
  },
  {
    id: "special-access", category: PA, quick: false,
    title: "Other special app access", lookFor: "Look for apps you don't recognise, or access you don't remember granting.",
    what: "Other special access such as usage access, modify system settings, and all-files access.",
    why: "These permissions give apps unusual reach into your phone. Some apps need them for features you use.",
    where: "Settings → Apps → Special app access — open each item and look at which apps are allowed.",
    review: "For each item, keep apps you recognise and use for that feature. Turn off access you don't remember granting.",
  },
  {
    id: "vpn", category: NET, quick: true,
    title: "VPN configuration", lookFor: "Look for a VPN you don't remember setting up, or one set to \"Always on\" that you didn't choose.",
    what: "Whether any VPN is set up or always on.",
    why: "A VPN can see or redirect your internet traffic. That's fine if it's one you chose, like your work VPN or a trusted provider.",
    where: "Settings → Network & internet (or Connections) → VPN.",
    review: "If you see a VPN you didn't set up, remove it and check which app created it. Keep VPNs you chose deliberately.",
  },
  {
    id: "private-dns", category: NET, quick: false,
    title: "Private DNS", lookFor: "Look for a provider hostname you don't recognise. \"Automatic\", \"Off\" or a provider you chose is normal.",
    what: "Whether Private DNS is set to a provider you chose.",
    why: "DNS decides which websites your phone connects to. An unexpected provider could redirect you.",
    where: "Settings → Network & internet → Private DNS (on Samsung: Connections → More connection settings → Private DNS).",
    review: "\"Automatic\" or a provider you chose (such as dns.google or one.one.one.one) is fine. If you see a hostname you don't recognise, switch to Automatic.",
  },
  {
    id: "certificates", category: NET, quick: false,
    title: "User-installed certificates", lookFor: "Look for any certificate under User credentials. On a personal phone this list is often empty; on a work or school phone, one may be expected.",
    what: "Whether any security certificates were added by a user.",
    why: "A user-installed certificate can let someone read encrypted traffic. Workplaces sometimes install one for managed phones.",
    where: "Settings → Security → More security settings → Encryption & credentials → User credentials (or Trusted credentials → User tab).",
    review: "If you find a certificate you don't recognise and your phone isn't managed by work or school, remove it.",
  },
  {
    id: "dev-options", category: NET, quick: false,
    title: "Developer options", lookFor: "Look for whether Developer options appears in Settings and is switched on, if you don't use it.",
    what: "Whether Developer options are turned on.",
    why: "Developer options unlock settings meant for app testing. Most people don't need them on.",
    where: "Settings → System → Developer options (only visible if it has been enabled).",
    review: "If you don't use them, turn Developer options off with the switch at the top of that screen.",
  },
  {
    id: "usb-debugging", category: NET, quick: true,
    title: "USB debugging", lookFor: "Look for USB debugging switched on when you aren't developing or testing apps.",
    what: "Whether USB debugging is turned on.",
    why: "With USB debugging on, a connected computer can install apps and access data on your phone.",
    where: "Settings → System → Developer options → USB debugging. If you can't see Developer options, it's off.",
    review: "Turn USB debugging off unless you're actively developing or testing apps.",
  },
  {
    id: "perm-camera", category: PERM, quick: false,
    title: "Camera permission", lookFor: "Look for apps with camera access that don't obviously need it.",
    what: "Which apps can use your camera.",
    why: "Camera access is normal for camera, video-call and scanning apps, but not for most others.",
    where: "Settings → Security & privacy → Privacy → Permission manager → Camera.",
    review: "Change access to \"Ask every time\" or \"Don't allow\" for apps that don't obviously need the camera.",
  },
  {
    id: "perm-mic", category: PERM, quick: true,
    title: "Microphone permission", lookFor: "Look for apps with microphone access that don't obviously need to hear you.",
    what: "Which apps can use your microphone.",
    why: "Microphone access is expected for calls, voice notes and assistants, but unexpected elsewhere.",
    where: "Settings → Security & privacy → Privacy → Permission manager → Microphone.",
    review: "Limit or remove access for apps that don't need to hear you.",
  },
  {
    id: "perm-location", category: PERM, quick: false,
    title: "Location permission", lookFor: "Look for apps set to \"Allow all the time\", and apps with location access that don't need it.",
    what: "Which apps can see your location, and whether \"all the time\".",
    why: "Location reveals where you live and go. Maps and delivery apps need it while in use.",
    where: "Settings → Location → App location permissions.",
    review: "Prefer \"Allow only while using the app\". Remove \"Allow all the time\" unless the app genuinely needs it.",
  },
  {
    id: "perm-contacts", category: PERM, quick: false,
    title: "Contacts permission", lookFor: "Look for apps with contacts access that don't need your contact list to work.",
    what: "Which apps can read your contacts.",
    why: "Your contact list contains other people's information and can be uploaded by apps.",
    where: "Settings → Security & privacy → Privacy → Permission manager → Contacts.",
    review: "Remove access for apps that don't need your contacts to work.",
  },
  {
    id: "perm-sms", category: PERM, quick: true,
    title: "SMS & call permissions", lookFor: "Look for apps other than your messaging and phone apps that can read SMS or call logs.",
    what: "Which apps can read SMS or access call logs and phone.",
    why: "SMS often carries bank OTPs. Only your messaging and phone apps usually need this.",
    where: "Settings → Security & privacy → Privacy → Permission manager → SMS, Call logs, and Phone.",
    review: "If an app you don't recognise, or one that has no reason to, can read SMS, remove the permission.",
  },
  {
    id: "perm-files", category: PERM, quick: false,
    title: "Files & media permission", lookFor: "Look for apps with full access to photos or files that only need a few, or none.",
    what: "Which apps can access your photos, videos and files.",
    why: "Photos and documents may contain personal or financial details.",
    where: "Settings → Security & privacy → Privacy → Permission manager → Files and media / Photos and videos.",
    review: "Limit access to apps that need it, or choose \"Allow limited access\" where offered.",
  },
  {
    id: "perm-nearby", category: PERM, quick: false,
    title: "Nearby devices permission", lookFor: "Look for apps with nearby-device access that don't connect to any accessory you use.",
    what: "Which apps can find and connect to nearby devices.",
    why: "Nearby device access is used for Bluetooth accessories and casting, and can also be used for tracking.",
    where: "Settings → Security & privacy → Privacy → Permission manager → Nearby devices.",
    review: "Keep it for apps that connect to your accessories. Remove it for others.",
  },
  {
    id: "apps-unknown", category: APPS, quick: true,
    title: "Apps you don't recognise", lookFor: "Look for app names you don't recognise. Search the name first — some system apps have unfamiliar names.",
    what: "Whether any installed app is unfamiliar to you.",
    why: "An app you don't remember installing may have been added without your knowledge or bundled with another app.",
    where: "Settings → Apps → See all apps. Scroll through the full list.",
    review: "Search the app's name before acting — some system apps have unfamiliar names. If it isn't a system app and you don't need it, uninstall it.",
  },
  {
    id: "apps-recent", category: APPS, quick: false,
    title: "Recently installed apps", lookFor: "Look for recent installs you don't remember making.",
    what: "Which apps were installed recently.",
    why: "A recent unexpected install can be a sign someone else used your phone or a link tricked you.",
    where: "Play Store → profile icon → Manage apps & device → Manage → sort by \"Recently updated\" or \"Recently added\".",
    review: "Check that you remember installing each recent app. Look into any you don't.",
  },
  {
    id: "apps-sideloaded", category: APPS, quick: false,
    title: "Apps from outside trusted stores", lookFor: "Look for apps installed from a browser, file manager or chat app rather than an app store.",
    what: "Whether any apps came from outside the Play Store or your phone maker's store.",
    why: "Apps installed from links or files skip store safety checks.",
    where: "Settings → Apps → open an app → App details / \"App installed from\" (shown at the bottom). Play Protect in the Play Store can also scan apps.",
    review: "Make sure you trust the source of each such app. Run a Play Protect scan, and remove apps whose source you can't verify.",
  },
  {
    id: "apps-powerful", category: APPS, quick: false,
    title: "Apps with unusually powerful permissions", lookFor: "Look for simple apps (flashlight, wallpaper, games) holding SMS, contacts or accessibility access.",
    what: "Whether any app has far more permissions than its purpose needs.",
    why: "A simple app, like a flashlight or wallpaper app, shouldn't need SMS, contacts or accessibility access.",
    where: "Settings → Apps → open an app → Permissions.",
    review: "First confirm whether you recognise and use the app. If you do, remove permissions it doesn't need. Uninstall only if you don't need the app.",
  },
];

export const quickChecks = () => ANDROID_CHECKS.filter((c) => c.quick);
