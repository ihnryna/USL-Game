from pathlib import Path

def fix_folder_name(name: str) -> str:
    return name.encode("cp437").decode("utf-8")

BASE = Path(__file__).resolve().parents[2] / "data/raw/usl_200x200/USL_alphabet_train"

if not BASE.exists():
    print("❌ Folder not found:", BASE)
    exit()

print("Starting folder renaming...\n")

for p in BASE.iterdir():
    if p.is_dir():
        try:
            new_name = fix_folder_name(p.name)
            new_path = p.with_name(new_name)

            if new_path != p:
                if new_path.exists():
                    print(f"⚠️ SKIP (already exists): {p.name} -> {new_name}")
                else:
                    p.rename(new_path)
                    print(f"✅ RENAMED: {p.name} -> {new_name}")

        except Exception as e:
            print(f"❌ Error renaming {p.name}: {e}")

print("\n🎉 Done!")

