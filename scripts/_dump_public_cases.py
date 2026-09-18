import re, glob

files = {
    'cases.ts': 'src/data/cases.ts',
    'enhancedCases.ts': 'src/data/enhancedCases.ts',
    'additionalCases.ts': 'src/data/additionalCases.ts',
    'firstYearCases.ts': 'src/data/firstYearCases.ts',
    'secondYearCases.ts': 'src/data/secondYearCases.ts',
    'litflCases.ts': 'src/data/litflCases.ts',
}

for name, path in files.items():
    text = open(path).read()
    # split into case blocks by "    id: '"
    # find each case id + environmentVariant public context
    # simpler: regex for id + the env variant + surrounding fields
    for m in re.finditer(r"id:\s*'([^']+)'", text):
        cid = m.group(1)
        # find the environmentVariant near this id
        window = text[m.start():m.start()+6000]
        if "environmentVariant: 'public'" in window:
            # extract callReason, location, description, environment, hazards
            def grab(field):
                mm = re.search(field + r":\s*'((?:[^'\\]|\\.)*)'", window)
                return mm.group(1) if mm else ''
            title = grab('title')
            callReason = grab('callReason')
            location = grab('location')
            description = grab('description')
            environment = grab('environment')
            print(f"### {cid} [{name}]")
            print(f"  title: {title}")
            print(f"  callReason: {callReason}")
            print(f"  location: {location}")
            print(f"  description: {description}")
            print(f"  environment: {environment}")
            print()
