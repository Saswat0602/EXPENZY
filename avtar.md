# Default Avatars for Users & Groups (DiceBear + Jdenticon)

**Context:** This is a Splitwise-like expense app.  
We don’t need real profile photos. We want small, aesthetic, deterministic placeholders that:  
- auto-assign on create  
- are lightweight (SVG)  
- look consistent in lists  
- optionally allow user choice (curated styles only)

---

## Why two different avatar types?
In expense apps, screens show **people** and **groups** together (balances, expenses, members, etc).  
If both look similar, it’s hard to scan.

**Best UX:**
- **Users:** soft, friendly abstract avatars  
- **Groups:** badge-style geometric icons  
This makes “person vs group” instantly obvious.

---

## Recommended Setup

### Users → DiceBear (abstract styles)
Curate a small set:
- `rings` ✅ default (clean circular patterns)
- `shapes` (soft blobs)
- `initials` (letter badge)

### Groups → Jdenticon (identicons)
- badge-like, geometric style  
- looks like a “group logo”, not a person  
- deterministic + tiny SVG  

> Rule: **Never use the same style family for both users and groups.**

---

## Deterministic Avatars (Seed-based)
Avatars are generated from a **seed** (string).

- **User seed:** `userId` (or email/temp UUID during preview)
- **Group seed:** `groupId` (or group name/temp UUID during preview)

**Result:**
- same seed ⇒ same icon always  
- consistent across devices  
- no file storage required

---

## Implementation Strategy (Frontend First)
1. **NextJS generates preview instantly**
2. User/group creator sees immediate avatar icon
3. Frontend sends **seed + style/provider** to backend
4. **NestJS validates + recomputes avatar URL/SVG and stores**

**Why preview in FE?** better UX  
**Why recompute in BE?** don’t trust arbitrary styles from FE; BE is source-of-truth.

---

## What to Store in DB (Important)

✅ **Store:**
- seed
- style/provider
- optional cached URL

❌ **Do NOT store raw SVG text** unless you have a special reason.

### Why not store SVG?
- SVG per row increases DB size  
- seed+style is tiny and can regenerate anytime  
- future-proof if provider changes later

---

## Prisma Schema (Users + Groups)

```prisma
enum UserAvatarStyle {
  rings
  shapes
  initials
}

enum GroupIconProvider {
  jdenticon
  // If later you add dicebear for groups:
  // dicebear_identicon
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  username      String   @unique
  passwordHash  String?
  firstName     String?
  lastName      String?
  phone         String?

  // ✅ Avatar system
  avatarSeed    String
  avatarStyle   UserAvatarStyle @default(rings)
  avatarUrl     String? // optional cache

  isDeleted     Boolean  @default(false)
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Group {
  id            String   @id @default(uuid())
  name          String

  // ✅ Group icon system
  iconSeed      String
  iconProvider  GroupIconProvider @default(jdenticon)
  iconUrl       String? // optional cache

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}








export const USER_STYLES = ['rings', 'shapes', 'initials'] as const;
// If you ever switch groups to DiceBear identicon:
export const GROUP_STYLES = ['identicon'] as const;

export type UserAvatarStyle = (typeof USER_STYLES)[number];
export type GroupAvatarStyle = (typeof GROUP_STYLES)[number];

export function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}







import { useState } from "react";
import { USER_STYLES, dicebearUrl, UserAvatarStyle } from "@/utils/avatars";

export function UserAvatarPicker({ seed }: { seed: string }) {
  const [style, setStyle] = useState<UserAvatarStyle>("rings");

  return (
    <div>
      <div className="flex gap-3 mb-4">
        {USER_STYLES.map((s) => {
          const url = dicebearUrl(s, seed);
          return (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`p-1 rounded-full border ${
                style === s ? "border-black" : "border-gray-200"
              }`}
            >
              <img src={url} className="h-10 w-10 rounded-full" />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span>Selected:</span>
        <img src={dicebearUrl(style, seed)} className="h-8 w-8 rounded-full" />
      </div>

      {/* On save, send: { avatarSeed: seed, avatarStyle: style, avatarType: "user" } */}
    </div>
  );
}




import jdenticon from "jdenticon";

export function GroupIconPreview({ seed }: { seed: string }) {
  const svg = jdenticon.toSvg(seed, 64);
  return (
    <div className="flex items-center gap-3">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <span>Group icon preview</span>
    </div>
  );
}



await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...formValues,
    avatarSeed: seed,
    avatarStyle: selectedStyle,
    avatarType: "user",
  }),
});




await fetch("/api/groups", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name,
    iconSeed: seed,
    iconProvider: "jdenticon",
    iconType: "group",
  }),
});



const ALLOWED_USER_STYLES = new Set(["rings","shapes","initials"]);
const ALLOWED_GROUP_PROVIDERS = new Set(["jdenticon"]);

function buildUserAvatar(seed: string, style: string) {
  if (!ALLOWED_USER_STYLES.has(style)) style = "rings";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
