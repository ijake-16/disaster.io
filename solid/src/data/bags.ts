export interface BagOption {
    id: number;
    image: string;
    alt: string;
    weightLimit: number;
    volumeLimit: number;
    bagWeight: number;
    itemLimit: number;
    description: string;
  }
  
  export const bagOptions: BagOption[] = [
    {
      id: 1,
      image: "resource/militarybag.png",
      alt: "Military Backpack",
      weightLimit: 30,
      volumeLimit: 30,
      bagWeight: 5,
      itemLimit: 5,
      description: "튼튼 등산베낭",
    },
    {
      id: 2,
      image: "resource/kidbag.png",
      alt: "Cute Backpack",
      weightLimit: 15,
      volumeLimit: 15,
      bagWeight: 1,
      itemLimit: 10,
      description: "아동용 책가방",
    },
    {
      id: 3,
      image: "resource/ecobag.png",
      alt: "Eco Tote Bag",
      weightLimit: 10,
      volumeLimit: 15,
      bagWeight: 0.5,
      itemLimit: 15,
      description: "가벼운 에코백",
    },
  ];
  