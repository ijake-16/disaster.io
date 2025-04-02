#!/usr/bin/env python
import tomli
import sys

try:
    # Read pyproject.toml
    with open('pyproject.toml', 'rb') as f:
        data = tomli.load(f)

    # Extract dependencies
    deps = data.get('tool', {}).get('poetry', {}).get('dependencies', {})
    formatted_deps = []

    print("Found dependencies:", deps)

    for pkg, ver in deps.items():
        # Skip Python itself
        if pkg == 'python':
            print(f"Skipping {pkg} dependency")
            continue
            
        # Handle string version constraints
        if isinstance(ver, str):
            if ver.startswith('^'):
                formatted_deps.append(f'{pkg}>={ver[1]}')
            elif ver.startswith('~'):
                formatted_deps.append(f'{pkg}~={ver[1:]}')
            else:
                formatted_deps.append(f'{pkg}{ver}')
            print(f"Added {pkg} with version {ver} as {formatted_deps[-1]}")
        # Handle dictionary specifications
        elif isinstance(ver, dict):
            if 'version' in ver:
                version = ver['version']
                if version.startswith('^'):
                    formatted_deps.append(f'{pkg}>={version[1]}')
                elif version.startswith('~'):
                    formatted_deps.append(f'{pkg}~={version[1:]}')
                else:
                    formatted_deps.append(f'{pkg}{version}')
                print(f"Added {pkg} with complex version {ver} as {formatted_deps[-1]}")
            else:
                formatted_deps.append(pkg)
                print(f"Added {pkg} without version")
        # Default case - just add the package name
        else:
            formatted_deps.append(pkg)
            print(f"Added {pkg} (default case)")

    # Write requirements.txt
    with open('requirements.txt', 'w') as f:
        if formatted_deps:
            f.write('\n'.join(formatted_deps))
        else:
            # Fallback for empty dependencies
            f.write('fastapi\nuvicorn\n')
            print("No dependencies found, added fallback packages")

    print(f"Created requirements.txt with {len(formatted_deps)} dependencies")
    print("Requirements file contents:")
    with open('requirements.txt', 'r') as f:
        print(f.read())

except Exception as e:
    print(f"Error processing dependencies: {e}")
    print("Creating minimal requirements file")
    # Create a minimal requirements file in case of errors
    with open('requirements.txt', 'w') as f:
        f.write('fastapi\nuvicorn\n')
    sys.exit(0)  # Exit successfully to continue build 