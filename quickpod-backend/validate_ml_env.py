#!/usr/bin/env python3
"""
QuickPod ML Environment Validator
Checks if the environment is properly set up with compatible versions
"""

import sys
import subprocess
from packaging import version

def check_package_version(package_name, min_version=None, max_version=None, import_name=None):
    """Check if a package is installed with correct version constraints"""
    if import_name is None:
        import_name = package_name
    
    try:
        result = subprocess.run([sys.executable, '-c', f'import {import_name}; print({import_name}.__version__)'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            return False, f"{package_name} not installed", f"pip install {package_name}"
        
        installed_version = result.stdout.strip()
        
        if min_version and version.parse(installed_version) < version.parse(min_version):
            return False, f"{package_name} {installed_version} < required {min_version}", f"pip install '{package_name}>={min_version}'"
        
        if max_version and version.parse(installed_version) >= version.parse(max_version):
            return False, f"{package_name} {installed_version} >= max {max_version}", f"pip install '{package_name}>={min_version},<{max_version}' --force-reinstall"
        
        return True, f"{package_name} {installed_version} ✓", None
    
    except Exception as e:
        return False, f"Error checking {package_name}: {e}", f"pip install {package_name}"

def main():
    print("QuickPod ML Environment Validation")
    print("=" * 40)
    
    checks = [
        ("numpy", "1.21.0", "2.0.0", None),
        ("torch", "1.12.0", None, None),
        ("openai-whisper", None, None, "whisper"),
        ("transformers", "4.20.0", None, None),
    ]
    
    all_passed = True
    failed_checks = []
    
    for package, min_ver, max_ver, import_name in checks:
        passed, message, fix_cmd = check_package_version(package, min_ver, max_ver, import_name)
        print(f"  {message}")
        if not passed:
            all_passed = False
            failed_checks.append((package, fix_cmd))
    
    print("\n" + "=" * 40)
    if all_passed:
        print("✅ All checks passed! Environment is ready.")
        return 0
    else:
        print("❌ Some checks failed. Here's how to fix them:")
        print()
        
        for package, fix_cmd in failed_checks:
            print(f"Fix {package}:")
            print(f"  {fix_cmd}")
            print()
        
        print("Or run the complete fix:")
        print("  pip install 'numpy>=1.21.0,<2.0.0' --force-reinstall")
        print("  pip install -r ml_helper/requirements.txt")
        print()
        print("Or use the setup script:")
        print("  ./setup_ml_env.sh")
        return 1

if __name__ == "__main__":
    sys.exit(main())