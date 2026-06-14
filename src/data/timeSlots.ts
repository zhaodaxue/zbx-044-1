import { TimeSlot } from '@/types';

export const timeSlots: TimeSlot[] = [
  {
    id: '1',
    startTime: '06:00',
    endTime: '08:00',
    waveHeight: 0.4,
    windLevel: 1,
    suggestedLevel: 'beginner',
    safetyTips: [
      '晨间水温较低，建议穿着防寒防水服',
      '江面光线柔和，注意佩戴偏光镜防止眩光',
      '岸边湿滑，上下船时务必抓紧扶手',
    ],
  },
  {
    id: '2',
    startTime: '08:00',
    endTime: '10:00',
    waveHeight: 0.6,
    windLevel: 2,
    suggestedLevel: 'beginner',
    safetyTips: [
      '该时段水流平稳，适合基础动作练习',
      '请全程穿着救生衣，不得随意解开',
      '保持与其他船只至少 5 米安全距离',
    ],
  },
  {
    id: '3',
    startTime: '10:00',
    endTime: '12:00',
    waveHeight: 0.9,
    windLevel: 3,
    suggestedLevel: 'beginner',
    safetyTips: [
      '气温升高，注意补充水分防止中暑',
      '浪高略有增加，转弯时注意船体平衡',
      '如遇体力不支，请及时向教练挥手示意',
    ],
  },
  {
    id: '4',
    startTime: '13:00',
    endTime: '15:00',
    waveHeight: 1.1,
    windLevel: 4,
    suggestedLevel: 'advanced',
    safetyTips: [
      '午后风力增强，建议进阶学员下水',
      '浪高接近警戒值，注意避让过往船只尾浪',
      '建议两人以上结伴划行，禁止单独行动',
    ],
  },
  {
    id: '5',
    startTime: '15:00',
    endTime: '17:00',
    waveHeight: 1.3,
    windLevel: 5,
    suggestedLevel: 'advanced',
    safetyTips: [
      '浪高已超警戒值，仅允许有经验的进阶学员下水',
      '必须佩戴头盔，防止翻船时碰撞受伤',
      '全程在教练视线范围内活动，不得划出指定水域',
    ],
  },
  {
    id: '6',
    startTime: '17:00',
    endTime: '19:00',
    waveHeight: 1.8,
    windLevel: 6,
    suggestedLevel: 'advanced',
    safetyTips: [
      '浪高过大，强烈建议不要下水',
      '如确需下水，必须由教练陪同并签署免责协议',
      '黄昏视线变差，务必穿戴反光条并携带照明设备',
    ],
  },
];
