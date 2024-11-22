async function readItemsFromExcel() {
    try {
        const response = await fetch("Items.xlsx");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
        
        // 첫 번째 시트 선택
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 시트의 데이터를 JSON으로 변환
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // 데이터 매핑
        const items = data.map((row, index) => ({
            id: index + 1,
            korName: row['korName'] || '',
            name: row['name'] || '',
            weight: parseFloat(row['weight']) || 0,
            volume: parseFloat(row['volume']) || 0,
            description: row['description'] || '',
            imgsource: `resource/${row['name']}.png`
        }));

        console.log('Loaded items:', items); // 디버깅용
        return items;
        
    } catch (error) {
        console.error('Error reading Excel file:', error);
        // 에러 발생 시 빈 배열 반환하여 시스템이 계속 작동할 수 있도록 함
        return [];
    }
}

function getBagContents() {

    const bagContainer = document.getElementById("bag-container");
    const itemsInBag = bagContainer.querySelectorAll(".item.in-bag");

    const bagContents = {"items" : {}, "totalWeight": 0, "totalVolume": 0};
    itemsInBag.forEach((item) => {
        console.log(item.dataset);
        const iteminfo = item.dataset.id;
        const weight = parseFloat(item.dataset.weight);
        const volume = parseFloat(item.dataset.volume);

        if (!bagContents["items"][iteminfo]) {
            bagContents["items"][iteminfo] = 0;
        }

        bagContents["items"][iteminfo] += 1;
        bagContents.totalWeight += weight;
        bagContents.totalVolume += volume;
    });

    return bagContents;
}
    



class InventorySystem {
    constructor() {
        this.maxWeight = 100;
        this.maxVolume = 100;
        this.currentWeight = 0;
        this.currentVolume = 0;
        this.timeLeft = 150;
        this.items = [];

        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            this.items = await readItemsFromExcel();
            this.initializeElements();
            this.populateInventory();
            this.initializeEventListeners();
            this.startTimer();
        } catch (error) {
            console.error("Failed to initialize system:", error);
        }
    }

    initializeElements() {
        this.bagContainer = document.getElementById('bag-container');
        this.weightBar = document.getElementById('weight-bar');
        this.volumeBar = document.getElementById('volume-bar');
        this.weightInfo = document.getElementById('weight-info');
        this.volumeInfo = document.getElementById('volume-info');
        this.searchInput = document.querySelector('.search-bar input');
        this.timerElement = document.getElementById('timer-count');

        // 모달 관련 요소들
        this.modal = document.getElementById('item-modal');
        this.modalClose = document.querySelector('.modal-content > div:first-child');
        this.modalItemImg = document.getElementById('modal-item-img');
        this.modalItemName = document.getElementById('modal-item-name');
        this.modalItemWeight = document.getElementById('modal-item-weight');
        this.modalItemVolume = document.getElementById('modal-item-volume');
        this.modalItemDescription = document.getElementById('modal-item-description')
        this.quantityValue = document.getElementById('quantity-value');
        this.quantitySlider = document.getElementById('quantity-slider');
        this.addToBagBtn = document.querySelector('.modal-content button:last-child');
    }

    populateInventory() {
        const itemsGrid = document.querySelector('.items-grid');
        itemsGrid.innerHTML = ''; // 기존 아이템 비우기

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.draggable = true;
            itemElement.dataset.id = item.id;
            itemElement.dataset.korName = item.korName;
            itemElement.dataset.name = item.name;
            itemElement.dataset.weight = item.weight;
            itemElement.dataset.volume = item.volume;
            itemElement.dataset.description = item.description;

            const img = document.createElement('img');
            img.src = item.imgsource;
            img.alt = item.korName;

            const itemInfo = document.createElement('span');
            itemInfo.className = 'item-info';
            itemInfo.textContent = item.weight;

            itemElement.appendChild(img);
            itemElement.appendChild(itemInfo);
            itemsGrid.appendChild(itemElement);
        });
    }

    initializeEventListeners() {
        // 아이템 클릭 이벤트
        document.querySelectorAll('.item').forEach(item => {
            item.addEventListener('click', (e) => this.openItemModal(e.currentTarget));
        });

        // 검색 기능
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));

        // 모달 관련 이벤트
        this.modalClose.addEventListener('click', () => this.closeItemModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeItemModal();
        });

        this.quantitySlider.addEventListener('input', () => {
            this.quantityValue.textContent = this.quantitySlider.value;
            this.updateModalStats();
        });

        this.addToBagBtn.addEventListener('click', () => this.addItemToBag());
    }

    openItemModal(itemElement) {
        const itemId = itemElement.dataset.id;
        const item = this.items.find(i => i.id === parseInt(itemId));
        
        if (!item) return;

        this.selectedItem = {
            element: itemElement,
            ...item
        };

        this.modalItemImg.src = item.imgsource;
        this.modalItemName.textContent = item.korName;
        this.modalItemWeight.textContent = `${item.weight}kg`;
        this.modalItemVolume.textContent = `${item.volume}㎥`;
        this.modalItemDescription.textContent = item.description
        this.quantitySlider.value = '1';
        this.quantityValue.textContent = 1;
        
        this.modal.style.display = 'block';
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.item').forEach(item => {
            const itemKorName = item.dataset.korName.toLowerCase();
            if (itemKorName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 나머지 메서드들은 기존과 동일하게 유지
    closeItemModal() {
        this.modal.style.display = 'none';
        this.selectedItem = null;
    }

    updateModalStats() {
        const quantity = parseInt(this.quantityValue.textContent) || 1;
        const totalWeight = (this.selectedItem.weight * quantity).toFixed(1);
        const totalVolume = (this.selectedItem.volume * quantity).toFixed(1);
        
        this.modalItemWeight.textContent = `${totalWeight}kg`;
        this.modalItemVolume.textContent = `${totalVolume}㎥`;

        const projectedWeight = this.currentWeight + (this.selectedItem.weight * quantity);
        const projectedVolume = this.currentVolume + (this.selectedItem.volume * quantity);
        
        if (projectedWeight > this.maxWeight || projectedVolume > this.maxVolume) {
            this.addToBagBtn.disabled = true;
            this.addToBagBtn.style.backgroundColor = '#666';
        } else {
            this.addToBagBtn.disabled = false;
            this.addToBagBtn.style.backgroundColor = '#2ecc71';
        }
    }

    addItemToBag() {
        const quantity = parseInt(this.quantityValue.textContent) || 1;
        const totalWeight = this.selectedItem.weight * quantity;
        const totalVolume = this.selectedItem.volume * quantity;

        if (this.currentWeight + totalWeight > this.maxWeight ||
            this.currentVolume + totalVolume > this.maxVolume) {
            alert('가방의 용량이나 무게 제한을 초과합니다!');
            return;
        }

        for (let i = 0; i < quantity; i++) {
            const newItem = document.createElement('div');
            newItem.className = 'item in-bag';
            newItem.dataset.id = this.selectedItem.id;
            newItem.dataset.korName = this.selectedItem.korName;
            newItem.dataset.weight = this.selectedItem.weight;
            newItem.dataset.volume = this.selectedItem.volume;
            const itemWeight = this.selectedItem.weight;
            const itemVolume = this.selectedItem.volume;
            
            const img = document.createElement('img');
            img.src = this.selectedItem.imgsource;
            img.alt = this.selectedItem.korName;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-item';
            deleteBtn.innerHTML = '×';
            deleteBtn.onclick = () => this.removeItem(newItem, itemWeight, itemVolume);
            
            newItem.appendChild(img);
            newItem.appendChild(deleteBtn);
            this.bagContainer.appendChild(newItem);
        }

        this.updateCapacity(totalWeight, totalVolume);
        this.closeItemModal();
    }

    removeItem(item, weight, volume) {
        this.bagContainer.removeChild(item);
        this.updateCapacity(-weight, -volume);
    }

    updateCapacity(weight, volume) {
        const weightNum = parseFloat(weight) || 0;
        const volumeNum = parseFloat(volume) || 0;

        this.currentWeight = Math.max(0, this.currentWeight + weightNum);
        this.currentVolume = Math.max(0, this.currentVolume + volumeNum);

        const weightPercentage = Math.min(100, ((this.currentWeight / this.maxWeight) * 100)).toFixed(2);
        const volumePercentage = Math.min(100, ((this.currentVolume / this.maxVolume) * 100)).toFixed(2);

        this.weightBar.style.width = `${weightPercentage}%`;
        this.volumeBar.style.width = `${volumePercentage}%`;

        this.weightInfo.textContent = `${this.currentWeight.toFixed(1)}/${this.maxWeight}`;
        this.volumeInfo.textContent = `${this.currentVolume.toFixed(1)}/${this.maxVolume}`;
    }

    startTimer() {
        const timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(timerInterval);
                this.endGame();
            }
        }, 1000);
        this.timerElement.addEventListener("click", () => {
            const bagContents = getBagContents();
            console.log("Current Bag Contents:", bagContents);
        
            // 추가적으로 데이터를 서버로 전송하거나 다른 로직을 수행할 수 있습니다.
            this.endGame(); // 기존 종료 로직 호출
        });
        
    }

    endGame() {
        alert('시간이 종료되었습니다!');
        //window.location.href = 's7_sceneinfo.html';
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new InventorySystem();
});