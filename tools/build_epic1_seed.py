from pathlib import Path
import re
import json
import os
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT.parent / 'random-legendary' / 'src' / 'card' / 'card-database.ts'
SOURCE = Path(os.environ.get('LEGENDARY_SOURCE_CARD_DB', DEFAULT_SOURCE))
OUT = ROOT / 'src' / 'data' / 'canonical-game-data.json'

SPECIAL_SCHEME_MAP = {
    'Age of Ultron': {
        'notes': ['For 4 or 5 players, add 1 extra Villain Group.'],
        'modifiers': [{'type': 'conditional-add-villain-group', 'amount': 1, 'playerCounts': [4, 5]}],
    },
    'Break the Planet Asunder': {
        'notes': ['Use at least 7 Heroes in the setup.'],
        'modifiers': [{'type': 'set-min-heroes', 'value': 7}],
    },
    'Cursed Pages of the Darkhold Tome': {
        'notes': ['Add 1 extra Villain Group.'],
        'modifiers': [{'type': 'add-villain-group', 'amount': 1}],
    },
    'Deadlands Hordes Charge the Wall': {
        'notes': ['Add 1 extra Villain Group.'],
        'modifiers': [{'type': 'add-villain-group', 'amount': 1}],
    },
    'Detonate the Helicarrier': {
        'notes': ['Use at least 6 Heroes in the setup.'],
        'modifiers': [{'type': 'set-min-heroes', 'value': 6}],
    },
    'Divide and Conquer': {
        'notes': ['Use at least 7 Heroes in the setup.'],
        'modifiers': [{'type': 'set-min-heroes', 'value': 7}],
    },
    'Epic Super Hero Civil War': {
        'notes': ['For 1 player, use at least 4 Heroes in the setup.'],
        'modifiers': [{'type': 'conditional-set-min-heroes', 'value': 4, 'playerCounts': [1]}],
    },
    'Fall of the Hulks': {
        'notes': ['Adjust the selected Heroes so exactly 2 have "Hulk" in their names.'],
        'modifiers': [{'type': 'require-hero-name-match-count', 'pattern': 'Hulk', 'value': 2}],
    },
    'Forge the Infinity Gauntlet': {
        'notes': ['Force Infinity Gems and replace one random Villain Group with it.'],
        'forcedGroups': [{'category': 'villains', 'name': 'Infinity Gems'}],
        'modifiers': [{'type': 'replace-villain-group-with-specific-group', 'amount': 1}],
    },
    'HYDRA Helicarriers Hunt Heroes': {
        'notes': ['Add 1 extra Hero to the setup.'],
        'modifiers': [{'type': 'add-hero', 'amount': 1}],
    },
    'Hypnotize Every Human': {
        'notes': ['Set Bystanders to 0 and add 1 extra Henchman Group.'],
        'modifiers': [{'type': 'set-bystanders', 'value': 0}, {'type': 'add-henchman-group', 'amount': 1}],
    },
    'Midtown Bank Robbery': {
        'notes': ['Set Bystanders to 12.'],
        'modifiers': [{'type': 'set-bystanders', 'value': 12}],
    },
    'Negative Zone Prison Breakout': {
        'notes': ['Add 1 extra Henchman Group.'],
        'modifiers': [{'type': 'add-henchman-group', 'amount': 1}],
    },
    'Secret Invasion of the Skrull Shapeshifters': {
        'notes': ['Force the Skrulls Villain Group and use at least 6 Heroes in the setup.'],
        'forcedGroups': [{'category': 'villains', 'name': 'Skrulls'}],
        'modifiers': [{'type': 'set-min-heroes', 'value': 6}],
    },
    'Steal the Weaponized Plutonium': {
        'notes': ['Add 1 extra Villain Group.'],
        'modifiers': [{'type': 'add-villain-group', 'amount': 1}],
    },
    'Super Hero Civil War': {
        'notes': ['Requires at least 2 players.'],
        'constraints': {'minimumPlayerCount': 2},
    },
}

MASTERMIND_NOTES = {
    'Annihilus': ['In solo games, use 6 Henchmen cards.'],
    'Ego, The Living Planet': ['Add 1 extra Villain Group.'],
    'Bastion': ['Special lead hint: Sentinel.'],
    'Deathbird': ["Special lead hint: Shi'Ar."],
}

SET_CATALOG = {
    'Core Set': {'year': 2012, 'type': 'base', 'aliases': ['Legendary: A Marvel Deck Building Game']},
    'Dark City': {'year': 2013, 'type': 'large-expansion', 'aliases': []},
    'Fantastic Four': {'year': 2014, 'type': 'small-expansion', 'aliases': []},
    'Paint the Town Red': {'year': 2014, 'type': 'small-expansion', 'aliases': []},
    'Guardians of the Galaxy': {'year': 2014, 'type': 'small-expansion', 'aliases': []},
    'Villains': {'year': 2014, 'type': 'standalone', 'aliases': ['Legendary: Villains']},
    'Fear Itself': {'year': 2015, 'type': 'small-expansion', 'aliases': []},
    'Secret Wars, Volume 1': {'year': 2015, 'type': 'large-expansion', 'aliases': ['Secret Wars Vol. 1']},
    'Secret Wars, Volume 2': {'year': 2015, 'type': 'large-expansion', 'aliases': ['Secret Wars Vol. 2']},
    'Captain America 75th Anniversary': {'year': 2016, 'type': 'small-expansion', 'aliases': []},
    'Civil War': {'year': 2016, 'type': 'large-expansion', 'aliases': []},
    'Deadpool': {'year': 2017, 'type': 'small-expansion', 'aliases': []},
    'Champions': {'year': 2018, 'type': 'small-expansion', 'aliases': []},
    'Marvel Studios, Phase 1': {'year': 2019, 'type': 'small-expansion', 'aliases': ['MCU Phase 1']},
    "Marvel Studios' Guardians of the Galaxy": {'year': 2019, 'type': 'small-expansion', 'aliases': ['MCU Guardians of the Galaxy']},
    'World War Hulk': {'year': 2019, 'type': 'large-expansion', 'aliases': []},
    'S.H.I.E.L.D.': {'year': 2019, 'type': 'large-expansion', 'aliases': ['SHIELD']},
    'Ant-Man': {'year': 2019, 'type': 'small-expansion', 'aliases': []},
    'Dimensions': {'year': 2019, 'type': 'small-expansion', 'aliases': []},
    'Into the Cosmos': {'year': 2020, 'type': 'small-expansion', 'aliases': []},
    'Realm of Kings': {'year': 2020, 'type': 'small-expansion', 'aliases': []},
    'Heroes of Asgard': {'year': 2020, 'type': 'small-expansion', 'aliases': []},
    'Black Widow': {'year': 2020, 'type': 'small-expansion', 'aliases': []},
    'Black Panther': {'year': 2021, 'type': 'small-expansion', 'aliases': []},
    'Doctor Strange and the Shadows of Nightmare': {'year': 2021, 'type': 'small-expansion', 'aliases': []},
    'Annihilation': {'year': 2021, 'type': 'small-expansion', 'aliases': []},
    'Venom': {'year': 2021, 'type': 'large-expansion', 'aliases': []},
    'The New Mutants': {'year': 2021, 'type': 'small-expansion', 'aliases': []},
    'X-Men': {'year': 2022, 'type': 'large-expansion', 'aliases': []},
    'Revelations': {'year': 2022, 'type': 'standalone', 'aliases': []},
    'Messiah Complex': {'year': 2023, 'type': 'small-expansion', 'aliases': []},
    'Marvel Noir': {'year': 2023, 'type': 'small-expansion', 'aliases': []},
    'Spider-Man Homecoming': {'year': 2024, 'type': 'small-expansion', 'aliases': []},
}


def unquote(value: str) -> str:
    value = value.strip()
    if value.startswith("'") and value.endswith("'"):
        return value[1:-1].replace("\\'", "'")
    return value


def parse_source():
    text = SOURCE.read_text()
    lines = text.splitlines()
    section = None
    current = None
    items = defaultdict(list)
    collect_teams = False
    teams = []

    for line in lines:
        s = line.strip()
        if s.startswith("'masterminds': ["):
            section = 'masterminds'; continue
        if s.startswith("'schemes': ["):
            section = 'schemes'; continue
        if s.startswith("'villains': ["):
            section = 'villains'; continue
        if s.startswith("'henchmen': ["):
            section = 'henchmen'; continue
        if s.startswith("'heroes': ["):
            section = 'heroes'; continue
        if not section:
            continue
        if s == '{':
            current = {}
            teams = []
            collect_teams = False
            continue
        if current is None:
            continue
        if collect_teams:
            if s in (']', '],'):
                current['teams'] = teams[:]
                collect_teams = False
            elif s.startswith("'"):
                teams.append(unquote(s.rstrip(',')))
            continue
        if s.startswith("'teams': ["):
            collect_teams = True
            continue
        match = re.match(r"'([^']+)':\s*(.*?)(,)?$", s)
        if match:
            key, value, _ = match.groups()
            if key in {'name', 'extension', 'alwaysLead', 'alwaysLeadCategory', 'specialLead', 'minimumPlayerCount'}:
                current[key] = unquote(value)
        if s in ('},', '}'):
            if 'name' in current and 'extension' in current:
                items[section].append(current.copy())
            current = None
    return items


def build_seed(items):
    result = {
        'setCatalog': [{'name': name, **meta} for name, meta in SET_CATALOG.items()],
        'rawCardData': {
            'heroes': [],
            'masterminds': [],
            'villainGroups': [],
            'henchmanGroups': [],
            'schemes': [],
        }
    }

    for hero in items['heroes']:
        result['rawCardData']['heroes'].append({
            'name': hero['name'].strip(),
            'setName': hero['extension'],
            'aliases': [],
            'teams': [t for t in hero.get('teams', []) if t],
            'cardCount': 14,
        })

    for group in items['villains']:
        result['rawCardData']['villainGroups'].append({
            'name': group['name'].strip(),
            'setName': group['extension'],
            'aliases': [],
            'cardCount': 8,
        })

    for group in items['henchmen']:
        result['rawCardData']['henchmanGroups'].append({
            'name': group['name'].strip(),
            'setName': group['extension'],
            'aliases': [],
            'cardCount': 10,
        })

    for mastermind in items['masterminds']:
        notes = MASTERMIND_NOTES.get(mastermind['name'].strip(), []).copy()
        if 'specialLead' in mastermind:
            notes.append(f"Special lead hint: {mastermind['specialLead']}.")
        result['rawCardData']['masterminds'].append({
            'name': mastermind['name'].strip(),
            'setName': mastermind['extension'],
            'aliases': [],
            'leadName': mastermind.get('alwaysLead', '').strip() or None,
            'leadCategory': mastermind.get('alwaysLeadCategory') or None,
            'notes': notes,
        })

    for scheme in items['schemes']:
        name = scheme['name'].strip()
        entry = {
            'name': name,
            'setName': scheme['extension'],
            'aliases': [],
            'constraints': {'minimumPlayerCount': int(scheme['minimumPlayerCount'])} if 'minimumPlayerCount' in scheme else {'minimumPlayerCount': None},
            'forcedGroups': [],
            'modifiers': [],
            'notes': [],
        }
        special = SPECIAL_SCHEME_MAP.get(name)
        if special:
            if special.get('constraints'):
                entry['constraints'] = special['constraints']
            entry['forcedGroups'].extend(special.get('forcedGroups', []))
            entry['modifiers'].extend(special.get('modifiers', []))
            entry['notes'].extend(special.get('notes', []))
        result['rawCardData']['schemes'].append(entry)

    return result


if __name__ == '__main__':
    seed = build_seed(parse_source())
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(seed, ensure_ascii=False, indent=2))
    print(f'Wrote {OUT}')
    print(f"Sets: {len(seed['setCatalog'])}")
    for key, value in seed['rawCardData'].items():
        print(f'{key}: {len(value)}')

