import os

def print_package_structure(path: str, prefix: str = ''):
    """주어진 경로(path)의 디렉터리 구조를 트리 형태로 출력"""
    items = sorted(os.listdir(path))
    for index, item in enumerate(items):
        item_path = os.path.join(path, item)
        connector = '└── ' if index == len(items) - 1 else '├── '
        print(prefix + connector + item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            extension = '    ' if index == len(items) - 1 else '│   '
            print_package_structure(item_path, prefix + extension)

# 사용 예시
if __name__ == '__main__':
    target_path = './'  # 패키지 경로를 여기에 입력
    print(f"📦 {os.path.basename(target_path)}")
    print_package_structure(target_path)
