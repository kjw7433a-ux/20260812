import { MenuItem, StoreConfig } from '../types';

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: '🐷 꽃돼지 PC방',
  noticeBanner: '⏰ 2026. 8. 14. 단 하루 프리미엄 본점 오픈 이벤트 진행 중!',
  isEventActive: true,
  eventTitle: '✨ VIP 프리미엄 오픈 초대권 ✨',
  eventDescription: '🎁 겸댕혀눙잉, 겸댕민또는 전액 무료! (본 초대권 지참 시 적용)',
  soundEnabled: true,
  ttsEnabled: true,
  volume: 0.8,
  webhookConfig: {
    discordUrl: '',
    customUrl: '',
    enabled: false,
  },
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // 면류 & 분식 (Noodles & Snack)
  {
    id: 'noodle-1',
    name: '얼큰 라면',
    description: '얼큰하고 시원한 시그니처 뚝배기 라면',
    price: 3500,
    category: 'noodles',
    categoryName: '면류 & 분식',
    imageEmoji: '🍜',
    badge: '매콤 🌶️',
    isPopular: true,
    options: [
      {
        id: 'opt-spicy',
        title: '맵기 선택',
        required: true,
        choices: [
          { name: '보통맛', price: 0 },
          { name: '순한맛', price: 0 },
          { name: '매운맛 (신라면 극강)', price: 0 },
        ],
      },
      {
        id: 'opt-topping',
        title: '토핑 추가',
        required: false,
        choices: [
          { name: '계란후라이 추가', price: 500 },
          { name: '체다치즈 추가', price: 500 },
          { name: '떡사리 추가', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'noodle-2',
    name: '매콤달콤 떡볶이',
    description: '쫄깃하고 매콤달콤 양념이 쏙 배어든 PC방 대표 떡볶이',
    price: 4000,
    category: 'noodles',
    categoryName: '면류 & 분식',
    imageEmoji: '🌶️',
    badge: '최고 인기 👍',
    isPopular: true,
    options: [
      {
        id: 'opt-tbk-topping',
        title: '토핑 추가',
        required: false,
        choices: [
          { name: '김말이 (2개) 추가', price: 1000 },
          { name: '모짜렐라 치즈 추가', price: 1000 },
          { name: '삶은 계란 추가', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'noodle-3',
    name: '속이 꽉 찬 찐만두',
    description: '육즙이 팡팡 터지는 고소하고 야들야들한 찐만두 (6개)',
    price: 3500,
    category: 'noodles',
    categoryName: '면류 & 분식',
    imageEmoji: '🥟',
    options: [
      {
        id: 'opt-mandoo-type',
        title: '종류 선택',
        required: true,
        choices: [
          { name: '고기만두', price: 0 },
          { name: '김치만두', price: 0 },
          { name: '반반 (고기3 + 김치3)', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'noodle-4',
    name: '중독성 강한 짜파게티',
    description: '꾸덕한 짜장 소스에 촉촉함이 살아있는 단짠 짜파게티',
    price: 3500,
    category: 'noodles',
    categoryName: '면류 & 분식',
    imageEmoji: '🍝',
    badge: '인기 ⭐',
    isPopular: true,
    options: [
      {
        id: 'opt-jp-topping',
        title: '토핑 추가',
        required: false,
        choices: [
          { name: '반숙 계란후라이 추가', price: 500 },
          { name: '체다치즈 추가', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'noodle-5',
    name: '입에 쪽쪽 붙는 소떡소떡',
    description: '바삭하게 튀긴 떡과 육즙 팡팡 소시지의 환상 궁합',
    price: 3500,
    category: 'noodles',
    categoryName: '면류 & 분식',
    imageEmoji: '🍢',
    options: [
      {
        id: 'opt-sotteok-sauce',
        title: '소스 선택',
        required: true,
        choices: [
          { name: '매운 양념 소스', price: 0 },
          { name: '달콤 양념 소스', price: 0 },
          { name: '머스타드 & 케찹', price: 0 },
        ],
      },
    ],
  },

  // 시그니처 감자 (Potato Special)
  {
    id: 'potato-1',
    name: '고소함 폭발 감자치즈전',
    description: '바삭하게 채썬 감자에 모짜렐라 치즈가 듬뿍 들어간 꽃돼지 시그니처',
    price: 5500,
    category: 'potato',
    categoryName: "꽃돼지's 시그니처 감자",
    imageEmoji: '🧀',
    badge: '시그니처 🐷',
    isSignature: true,
    isPopular: true,
    options: [
      {
        id: 'opt-pcheese-sauce',
        title: '소스 선택',
        required: true,
        choices: [
          { name: '양념 간장 소스', price: 0 },
          { name: '토마토 케찹', price: 0 },
          { name: '갈릭 디핑 소스 추가', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'potato-2',
    name: '휴게소 감성 알감자구이',
    description: '버터 향이 솔솔 나는 노릇노릇 고소한 추억의 알감자구이',
    price: 4000,
    category: 'potato',
    categoryName: "꽃돼지's 시그니처 감자",
    imageEmoji: '🔥',
    badge: '추천 ✨',
    isSignature: true,
    options: [
      {
        id: 'opt-potato-seasoning',
        title: '시즈닝 선택',
        required: true,
        choices: [
          { name: '달콤한 설탕 뿌리기', price: 0 },
          { name: '짭조름한 소금 뿌리기', price: 0 },
          { name: '버터 가루 시즈닝', price: 500 },
        ],
      },
    ],
  },

  // 추억의 음료 & 디저트 (Drinks & Sweet)
  {
    id: 'drinks-1',
    name: '새콤달콤 요구르트 (대용량)',
    description: '게임하다 갈증날 때 최고! 500ml 대용량 추억의 요구르트',
    price: 2000,
    category: 'drinks',
    categoryName: '추억의 음료 & 디저트',
    imageEmoji: '🥤',
    badge: '시원함 🧊',
    options: [
      {
        id: 'opt-yogurt-ice',
        title: '얼음 선택',
        required: true,
        choices: [
          { name: '시원한 얼음 가득', price: 0 },
          { name: '얼음 살짝', price: 0 },
          { name: '얼음 없음', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'drinks-2',
    name: '고소하고 든든한 우유',
    description: '속을 편안하게 감싸주는 신선하고 고소한 우유 (300ml)',
    price: 2000,
    category: 'drinks',
    categoryName: '추억의 음료 & 디저트',
    imageEmoji: '🥛',
    options: [
      {
        id: 'opt-milk-temp',
        title: '온도 선택',
        required: true,
        choices: [
          { name: '시원하게', price: 0 },
          { name: '따뜻하게 스팀', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'drinks-3',
    name: '얼려 먹으면 더 맛있는 짜요짜요',
    description: '살짝 얼려먹는 아삭하고 새콤달콤한 추억의 짜요짜요',
    price: 1500,
    category: 'drinks',
    categoryName: '추억의 음료 & 디저트',
    imageEmoji: '🍦',
    options: [
      {
        id: 'opt-zzayo-flavor',
        title: '맛 선택',
        required: true,
        choices: [
          { name: '딸기맛 🍓', price: 0 },
          { name: '포도맛 🍇', price: 0 },
          { name: '복숭아맛 🍑', price: 0 },
        ],
      },
    ],
  },
];

