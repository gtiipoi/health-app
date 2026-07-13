// ====== 动作库 ======
export interface Exercise {
  name: string;
  category: 'warmup' | 'strength' | 'cardio' | 'stretch';
  target: string; // body part
  equipment: 'none' | 'dumbbell' | 'barbell' | 'machine' | 'cable' | 'bench' | 'mat';
  duration: number; // seconds, approximate
  description: string; // how to do it
  tips: string[]; // form tips
  difficulty: 1 | 2 | 3;
}

export const exerciseLibrary: Exercise[] = [
  // ===== 热身 Warmup =====
  { name: '开合跳', category: 'warmup', target: '全身', equipment: 'none', duration: 60, description: '双脚并拢站立，跳跃时双脚分开与肩同宽，同时双臂从体侧摆过头顶击掌，再跳回原位', tips: ['保持膝盖微屈缓冲', '核心收紧，保持呼吸节奏', '落地轻盈，避免膝盖锁死'], difficulty: 1 },
  { name: '高抬腿', category: 'warmup', target: '腿部/核心', equipment: 'none', duration: 45, description: '原地跑步，膝盖尽量抬高至与地面平行，摆臂配合腿部节奏', tips: ['大腿抬高至水平位置', '核心收紧保持身体稳定', '前脚掌着地'], difficulty: 1 },
  { name: '肩部绕环', category: 'warmup', target: '肩部', equipment: 'none', duration: 30, description: '站立，双肩同时向前画圈10次，再向后画圈10次，幅度逐渐加大', tips: ['手臂自然下垂', '圈越画越大', '保持呼吸顺畅'], difficulty: 1 },
  { name: '髋关节环绕', category: 'warmup', target: '髋部', equipment: 'none', duration: 40, description: '双手叉腰，一条腿抬起向外画圈，左右各10次', tips: ['支撑腿微屈', '幅度适中不要勉强', '上身保持稳定'], difficulty: 1 },
  { name: '原地踏步+摆臂', category: 'warmup', target: '全身', equipment: 'none', duration: 60, description: '原地踏步，双臂大幅度前后摆动，逐渐加快节奏', tips: ['下巴微收，目视前方', '从慢到快循序渐进', '呼吸配合步伐'], difficulty: 1 },
  { name: '手腕脚踝活动', category: 'warmup', target: '关节', equipment: 'none', duration: 30, description: '双手十指交叉转动手腕，双脚交替脚尖点地转动脚踝', tips: ['动作轻柔，不要过猛', '感觉到关节活动开即可'], difficulty: 1 },

  // ===== 居家无器械 - 上肢 =====
  { name: '标准俯卧撑', category: 'strength', target: '胸部/手臂', equipment: 'none', duration: 60, description: '双手与肩同宽撑地，身体成一条直线，屈肘下降至胸部接近地面，推起还原', tips: ['核心收紧，身体成直线', '手肘与身体呈45度角', '下降时吸气，推起时呼气', '做不了可以用跪姿'], difficulty: 2 },
  { name: '跪姿俯卧撑', category: 'strength', target: '胸部/手臂', equipment: 'none', duration: 60, description: '双膝着地，双手与肩同宽，身体从膝盖到头部成直线，做俯卧撑动作', tips: ['膝盖下方垫软垫', '核心保持收紧', '动作幅度完整'], difficulty: 1 },
  { name: '钻石俯卧撑', category: 'strength', target: '肱三头肌', equipment: 'none', duration: 50, description: '双手拇指和食指相触形成钻石形，置于胸下方，做窄距俯卧撑', tips: ['手肘紧贴身体两侧', '下降时肘部向后', '主要感受三头肌发力'], difficulty: 3 },
  { name: '椅子臂屈伸', category: 'strength', target: '肱三头肌', equipment: 'none', duration: 50, description: '背对稳固的椅子，双手撑在椅子边缘，双脚前伸，屈肘下降身体再推起', tips: ['椅子靠墙防滑', '下降至肘部约90度', '上身贴近椅子'], difficulty: 2 },

  // ===== 居家无器械 - 核心 =====
  { name: '平板支撑', category: 'strength', target: '核心', equipment: 'mat', duration: 60, description: '双肘撑地与肩同宽，脚尖着地，身体从头到脚成一条直线，保持不动', tips: ['核心收紧，不塌腰不撅臀', '目视下方，颈部放松', '正常呼吸不要憋气', '初学从30秒开始'], difficulty: 1 },
  { name: '卷腹', category: 'strength', target: '腹直肌', equipment: 'mat', duration: 50, description: '仰卧屈膝，双手放在耳侧，用腹部力量将上背部抬离地面，缓慢下放', tips: ['下巴与胸部保持一拳距离', '用腹部发力而非颈部', '上升呼气，下降吸气', '腰部始终贴地'], difficulty: 1 },
  { name: '俄罗斯转体', category: 'strength', target: '腹斜肌', equipment: 'none', duration: 45, description: '坐姿，双腿抬起，上身微微后仰，双手合十左右转动', tips: ['双脚可着地降低难度', '转动时眼睛跟随手', '保持背部挺直'], difficulty: 2 },
  { name: '仰卧举腿', category: 'strength', target: '下腹', equipment: 'mat', duration: 50, description: '仰卧，双手放在臀下，双腿并拢抬起至与地面垂直，缓慢下放但不触地', tips: ['腰部始终保持贴地', '下放时控制速度', '腿伸不直可以微屈'], difficulty: 2 },
  { name: '登山者', category: 'strength', target: '核心/有氧', equipment: 'none', duration: 40, description: '俯卧撑起始姿势，交替将膝盖向胸部方向提拉，保持快速节奏', tips: ['核心收紧，不塌腰', '前脚掌着地', '保持匀速节奏'], difficulty: 2 },
  { name: '死虫式', category: 'strength', target: '核心', equipment: 'mat', duration: 45, description: '仰卧，四肢朝天，同时将对侧手脚缓慢下放接近地面，然后还原', tips: ['腰部贴地，核心收紧', '动作缓慢有控制', '配合呼吸'], difficulty: 1 },
  { name: '侧平板支撑', category: 'strength', target: '腹斜肌', equipment: 'mat', duration: 40, description: '侧卧，下方手肘撑地，髋部抬离地面，身体成一条斜线，保持', tips: ['髋部不要下沉', '可以上方腿在前做支撑', '左右各做一组'], difficulty: 2 },

  // ===== 居家无器械 - 下肢 =====
  { name: '自重深蹲', category: 'strength', target: '臀腿', equipment: 'none', duration: 55, description: '双脚与肩同宽，脚尖微外八，像坐椅子一样下蹲至大腿与地面平行，然后站起', tips: ['膝盖与脚尖方向一致', '背部保持挺直', '重心在脚后跟', '下蹲吸气，站起呼气'], difficulty: 1 },
  { name: '弓步蹲', category: 'strength', target: '臀腿', equipment: 'none', duration: 50, description: '一脚前跨屈膝至90度，后膝接近地面但不触地，前腿发力站起', tips: ['前膝不超过脚尖', '上身保持直立', '左右交替各做一半'], difficulty: 2 },
  { name: '臀桥', category: 'strength', target: '臀部', equipment: 'mat', duration: 50, description: '仰卧屈膝，双脚踩地，臀部发力上抬至身体成直线，顶峰收缩后缓慢下放', tips: ['上抬时夹紧臀部', '顶部停留1-2秒', '不要过度挺腰'], difficulty: 1 },
  { name: '保加利亚分腿蹲', category: 'strength', target: '臀腿', equipment: 'none', duration: 55, description: '后脚搭在椅子/沙发上，前脚前跨一步，屈前膝下蹲至大腿平行地面', tips: ['前膝不超过脚尖', '上身微前倾', '后腿只做支撑不发力'], difficulty: 3 },
  { name: '原地箭步跳', category: 'strength', target: '臀腿/有氧', equipment: 'none', duration: 40, description: '弓步姿势起跳，空中交换双腿，落地成另一侧弓步', tips: ['落地时膝盖缓冲', '核心收紧保持平衡', '动作连贯有节奏'], difficulty: 3 },
  { name: '靠墙静蹲', category: 'strength', target: '腿部', equipment: 'none', duration: 60, description: '背靠墙，双脚前移一步，沿墙下滑至大腿与地面平行，保持不动', tips: ['大腿与地面平行', '膝盖不超过脚尖', '可以大腿和小腿90度'], difficulty: 1 },

  // ===== 健身房 - 上肢 =====
  { name: '哑铃卧推', category: 'strength', target: '胸部', equipment: 'dumbbell', duration: 60, description: '仰卧在平板凳上，双手各持哑铃置于胸部两侧，向上推起至手臂伸直，缓慢下放', tips: ['肩胛骨收紧贴凳', '手腕保持中立位', '推起时哑铃不碰撞', '选择能做8-12次的重量'], difficulty: 2 },
  { name: '哑铃飞鸟', category: 'strength', target: '胸部', equipment: 'dumbbell', duration: 50, description: '仰卧，双手持哑铃在胸部上方掌心相对，手臂微屈向两侧展开至胸肌有拉伸感，再夹回', tips: ['手臂保持微屈不锁死', '感受胸肌的拉伸和收缩', '重量不宜过大'], difficulty: 2 },
  { name: '哑铃推举', category: 'strength', target: '肩部', equipment: 'dumbbell', duration: 55, description: '坐姿，双手持哑铃在肩部高度，掌心向前，向上推至手臂伸直但不锁死', tips: ['核心收紧稳定躯干', '背部紧贴靠背', '不要在最低点弹震'], difficulty: 2 },
  { name: '哑铃侧平举', category: 'strength', target: '肩部', equipment: 'dumbbell', duration: 45, description: '站立，双手持哑铃垂于体侧，手臂微屈向两侧平举至与肩同高，缓慢下放', tips: ['手肘微屈保持角度不变', '不要耸肩，用肩膀发力', '轻重量高次数最佳'], difficulty: 2 },
  { name: '哑铃弯举', category: 'strength', target: '肱二头肌', equipment: 'dumbbell', duration: 45, description: '站姿，双手持哑铃，掌心向前，屈肘将哑铃举向肩部，缓慢下放', tips: ['大臂保持不动贴身体', '顶峰收缩1秒', '不要借力晃动身体'], difficulty: 1 },
  { name: '杠铃卧推', category: 'strength', target: '胸部', equipment: 'barbell', duration: 60, description: '仰卧，双手握杠铃杆略宽于肩，从架上取下杠铃，下放至胸部轻触，推起', tips: ['初学者请找人保护', '全握杠铃（拇指绕过去）', '脚踩实地稳定身体'], difficulty: 3 },
  { name: '坐姿划船', category: 'strength', target: '背部', equipment: 'cable', duration: 55, description: '坐姿，双脚踩稳，双手拉V把，背部发力将把手拉向腹部，夹紧肩胛骨，缓慢还原', tips: ['背部发力而非手臂', '拉到腹部而非胸口', '还原时控制不要被拉回去'], difficulty: 2 },
  { name: '高位下拉', category: 'strength', target: '背部', equipment: 'machine', duration: 55, description: '坐姿，双手宽握横杆，背部发力下拉至锁骨位置，缓慢还原', tips: ['下拉时挺胸', '肩胛骨下沉', '握距比肩略宽', '不要过度后仰'], difficulty: 2 },

  // ===== 健身房 - 下肢 =====
  { name: '杠铃深蹲', category: 'strength', target: '臀腿', equipment: 'barbell', duration: 65, description: '杠铃置于斜方肌上（不是颈椎），双脚与肩同宽，下蹲至大腿平行地面，站起', tips: ['初学者用空杆练动作', '膝盖与脚尖同向', '核心收紧保护腰椎', '最好在深蹲架内做'], difficulty: 3 },
  { name: '哑铃罗马尼亚硬拉', category: 'strength', target: '臀腿/后链', equipment: 'dumbbell', duration: 55, description: '双手持哑铃在腿前，微屈膝，臀部向后推，上身向前倾，哑铃沿腿部下放至小腿中段，臀部发力还原', tips: ['背部始终挺直不弓背', '哑铃贴着腿走', '感受大腿后侧拉伸', '膝盖微屈角度不变'], difficulty: 2 },
  { name: '腿举', category: 'strength', target: '腿部', equipment: 'machine', duration: 55, description: '坐入腿举机，双脚与肩同宽踩在踏板上，屈膝至90度，蹬至腿微屈不锁死', tips: ['全程脚踩实在踏板上', '膝盖不要内扣', '不要锁死膝关节'], difficulty: 2 },
  { name: '腿部弯举', category: 'strength', target: '大腿后侧', equipment: 'machine', duration: 45, description: '俯卧在腿弯举机上，脚踝勾住滚轴，弯曲膝盖将滚轴向臀部方向拉动', tips: ['控制节奏不要甩', '顶峰停留1秒挤压', '还原时缓慢'], difficulty: 1 },
  { name: '腿部伸展', category: 'strength', target: '股四头肌', equipment: 'machine', duration: 45, description: '坐姿，脚踝前方抵住滚轴，伸膝至腿伸直，缓慢下放', tips: ['脚尖勾起', '伸膝时呼气', '顶部不要锁死膝盖'], difficulty: 1 },

  // ===== 有氧 Cardio =====
  { name: '跳绳', category: 'cardio', target: '全身', equipment: 'none', duration: 180, description: '手持跳绳，前脚掌落地，手腕转动带动绳子，保持匀速', tips: ['前脚掌落地缓冲', '膝盖微屈', '手腕转绳不要挥臂', '可分多组完成'], difficulty: 2 },
  { name: '波比跳', category: 'cardio', target: '全身', equipment: 'none', duration: 45, description: '从站立下蹲→双手撑地→双脚后跳成俯卧撑姿势→跳回→站起跳跃', tips: ['核心全程收紧', '可以根据体力调整速度', '膝盖有伤可以省略跳跃'], difficulty: 3 },
  { name: '原地冲刺跑', category: 'cardio', target: '全身', equipment: 'none', duration: 30, description: '原地快速跑动，膝盖抬高，摆臂快速有力，尽全力冲刺', tips: ['全速冲刺，不要留力', '手臂快速摆动', '前脚掌落地'], difficulty: 2 },
  { name: '登山跑', category: 'cardio', target: '核心/全身', equipment: 'none', duration: 40, description: '俯卧撑姿势，交替快速将膝盖拉向胸部，像在爬山', tips: ['核心收紧不塌腰', '保持快速稳定节奏', '前脚掌着地'], difficulty: 2 },

  // ===== 拉伸 Stretch =====
  { name: '胸部拉伸', category: 'stretch', target: '胸部', equipment: 'none', duration: 30, description: '站姿或坐姿，双手在背后交握，手臂伸直向后抬，感受胸肌拉伸', tips: ['不要过度挺腰', '手臂伸直但不要锁死', '保持15-30秒'], difficulty: 1 },
  { name: '背部拉伸', category: 'stretch', target: '背部', equipment: 'none', duration: 30, description: '双手前伸交握，弓背低头，将手臂尽量前伸，感受上背拉伸', tips: ['下巴贴近胸口', '手臂前伸时呼气', '保持15-30秒'], difficulty: 1 },
  { name: '大腿前侧拉伸', category: 'stretch', target: '股四头肌', equipment: 'none', duration: 30, description: '站姿，一手扶墙，另一手抓同侧脚踝将脚跟拉向臀部', tips: ['双膝并拢', '骨盆不要前倾', '每条腿保持20-30秒'], difficulty: 1 },
  { name: '大腿后侧拉伸', category: 'stretch', target: '腘绳肌', equipment: 'none', duration: 30, description: '坐姿，一腿伸直一腿屈，上身前倾够伸直的脚尖', tips: ['不要弓背', '感觉到大腿后侧拉伸', '不需要碰到脚尖'], difficulty: 1 },
  { name: '臀部拉伸', category: 'stretch', target: '臀部', equipment: 'mat', duration: 30, description: '仰卧，一腿屈膝将脚踝放在另一腿膝盖上，双手抱住下方大腿拉向胸部', tips: ['头和肩膀放松贴地', '感觉到臀部拉伸', '每条腿保持20-30秒'], difficulty: 1 },
  { name: '肩颈拉伸', category: 'stretch', target: '肩颈', equipment: 'none', duration: 25, description: '坐姿，右手绕过头顶摸左耳，轻轻将头拉向右肩方向，换边', tips: ['动作轻柔不要猛拉', '对侧肩膀下沉', '保持15-20秒'], difficulty: 1 },
  { name: '猫牛式', category: 'stretch', target: '脊柱', equipment: 'mat', duration: 35, description: '四足跪姿，吸气时塌腰抬头（牛式），呼气时弓背低头（猫式），交替进行', tips: ['动作配合呼吸缓慢进行', '感受脊柱逐节活动', '做6-8次'], difficulty: 1 },
  { name: '婴儿式', category: 'stretch', target: '全身放松', equipment: 'mat', duration: 40, description: '跪姿，双膝分开与髋同宽，上身前倾额头触地，手臂前伸或放在体侧', tips: ['臀部尽量坐向脚跟', '完全放松，深呼吸', '保持30秒以上'], difficulty: 1 },
];

// ====== 训练模板 ======
export interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'home' | 'gym';
  target: string;
  duration: number; // total minutes
  difficulty: '初级' | '中级' | '高级';
  description: string;
  exercises: { name: string; sets?: number; reps?: string; duration?: number; rest: number }[];
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'home-fullbody-1',
    name: '居家全身燃脂',
    type: 'home',
    target: '全身',
    duration: 25,
    difficulty: '初级',
    description: '无需任何器械，适合新手入门的全身训练，兼顾力量与有氧',
    exercises: [
      { name: '开合跳', duration: 60, rest: 20 },
      { name: '自重深蹲', sets: 3, reps: '15次', rest: 30 },
      { name: '跪姿俯卧撑', sets: 3, reps: '10-12次', rest: 30 },
      { name: '平板支撑', duration: 40, rest: 20 },
      { name: '卷腹', sets: 3, reps: '15次', rest: 25 },
      { name: '臀桥', sets: 3, reps: '15次', rest: 25 },
      { name: '登山者', duration: 30, rest: 20 },
      { name: '胸部拉伸', duration: 25, rest: 10 },
      { name: '大腿前侧拉伸', duration: 25, rest: 10 },
      { name: '婴儿式', duration: 30, rest: 0 },
    ],
  },
  {
    id: 'home-core-1',
    name: '居家腹肌雕刻',
    type: 'home',
    target: '核心/腹部',
    duration: 20,
    difficulty: '中级',
    description: '聚焦核心肌群，打造腹肌线条，搭配垫上完成',
    exercises: [
      { name: '肩部绕环', duration: 30, rest: 10 },
      { name: '平板支撑', duration: 50, rest: 20 },
      { name: '卷腹', sets: 4, reps: '20次', rest: 25 },
      { name: '俄罗斯转体', sets: 3, reps: '20次(每侧10次)', rest: 25 },
      { name: '仰卧举腿', sets: 3, reps: '15次', rest: 30 },
      { name: '登山者', duration: 40, rest: 20 },
      { name: '死虫式', sets: 3, reps: '12次(每侧)', rest: 20 },
      { name: '侧平板支撑', duration: 30, rest: 15 },
      { name: '猫牛式', duration: 30, rest: 10 },
      { name: '婴儿式', duration: 40, rest: 0 },
    ],
  },
  {
    id: 'home-hiit-1',
    name: '居家HIIT高效燃脂',
    type: 'home',
    target: '全身',
    duration: 18,
    difficulty: '高级',
    description: '高强度间歇训练，短时高效燃脂，适合有一定基础的用户',
    exercises: [
      { name: '开合跳', duration: 45, rest: 15 },
      { name: '高抬腿', duration: 40, rest: 15 },
      { name: '波比跳', duration: 40, rest: 20 },
      { name: '登山跑', duration: 35, rest: 15 },
      { name: '原地箭步跳', duration: 35, rest: 20 },
      { name: '原地冲刺跑', duration: 25, rest: 15 },
      { name: '自重深蹲', duration: 40, rest: 20 },
      { name: '开合跳', duration: 40, rest: 15 },
      { name: '全身拉伸', duration: 60, rest: 0 },
    ],
  },
  {
    id: 'home-lower-1',
    name: '居家翘臀美腿',
    type: 'home',
    target: '臀腿',
    duration: 22,
    difficulty: '中级',
    description: '针对臀腿的训练，改善下半身线条',
    exercises: [
      { name: '髋关节环绕', duration: 35, rest: 10 },
      { name: '自重深蹲', sets: 4, reps: '15-20次', rest: 30 },
      { name: '弓步蹲', sets: 3, reps: '12次(每侧)', rest: 30 },
      { name: '臀桥', sets: 4, reps: '20次', rest: 25 },
      { name: '保加利亚分腿蹲', sets: 3, reps: '10次(每侧)', rest: 35 },
      { name: '靠墙静蹲', duration: 50, rest: 20 },
      { name: '大腿前侧拉伸', duration: 30, rest: 10 },
      { name: '臀部拉伸', duration: 30, rest: 0 },
    ],
  },
  {
    id: 'gym-push-1',
    name: '健身房推日（胸肩三头）',
    type: 'gym',
    target: '胸/肩/三头',
    duration: 50,
    difficulty: '中级',
    description: '经典的推类动作训练日，发展上肢推力',
    exercises: [
      { name: '肩部绕环', duration: 30, rest: 10 },
      { name: '开合跳', duration: 45, rest: 15 },
      { name: '杠铃卧推', sets: 4, reps: '8-10次', rest: 90 },
      { name: '哑铃推举', sets: 3, reps: '10-12次', rest: 60 },
      { name: '哑铃飞鸟', sets: 3, reps: '12次', rest: 50 },
      { name: '哑铃侧平举', sets: 3, reps: '15次', rest: 45 },
      { name: '钻石俯卧撑', sets: 2, reps: '力竭', rest: 45 },
      { name: '胸部拉伸', duration: 25, rest: 10 },
      { name: '肩颈拉伸', duration: 25, rest: 0 },
    ],
  },
  {
    id: 'gym-pull-1',
    name: '健身房拉日（背二头）',
    type: 'gym',
    target: '背/二头',
    duration: 50,
    difficulty: '中级',
    description: '拉类动作训练日，强化背部肌肉和后链',
    exercises: [
      { name: '肩部绕环', duration: 30, rest: 10 },
      { name: '高位下拉', sets: 4, reps: '10-12次', rest: 60 },
      { name: '坐姿划船', sets: 3, reps: '12次', rest: 55 },
      { name: '哑铃弯举', sets: 3, reps: '12-15次', rest: 45 },
      { name: '哑铃罗马尼亚硬拉', sets: 3, reps: '10-12次', rest: 70 },
      { name: '背部拉伸', duration: 30, rest: 10 },
      { name: '猫牛式', duration: 30, rest: 0 },
    ],
  },
  {
    id: 'gym-legs-1',
    name: '健身房腿部日',
    type: 'gym',
    target: '臀腿',
    duration: 50,
    difficulty: '高级',
    description: '下肢力量训练，提升整体力量和代谢水平',
    exercises: [
      { name: '髋关节环绕', duration: 30, rest: 10 },
      { name: '原地踏步+摆臂', duration: 45, rest: 15 },
      { name: '杠铃深蹲', sets: 4, reps: '8-10次', rest: 120 },
      { name: '腿举', sets: 3, reps: '12次', rest: 60 },
      { name: '哑铃罗马尼亚硬拉', sets: 3, reps: '10次', rest: 70 },
      { name: '腿部弯举', sets: 3, reps: '12-15次', rest: 45 },
      { name: '腿部伸展', sets: 3, reps: '12-15次', rest: 45 },
      { name: '大腿前侧拉伸', duration: 30, rest: 10 },
      { name: '大腿后侧拉伸', duration: 30, rest: 10 },
      { name: '臀部拉伸', duration: 30, rest: 0 },
    ],
  },
  {
    id: 'gym-fullbody-1',
    name: '健身房全身训练',
    type: 'gym',
    target: '全身',
    duration: 45,
    difficulty: '初级',
    description: '适合健身新手的全身训练，熟悉基础动作',
    exercises: [
      { name: '原地踏步+摆臂', duration: 60, rest: 15 },
      { name: '哑铃卧推', sets: 3, reps: '12次', rest: 60 },
      { name: '高位下拉', sets: 3, reps: '12次', rest: 55 },
      { name: '哑铃推举', sets: 3, reps: '12次', rest: 50 },
      { name: '自重深蹲', sets: 3, reps: '15次', rest: 45 },
      { name: '平板支撑', duration: 45, rest: 20 },
      { name: '胸部拉伸', duration: 25, rest: 10 },
      { name: '婴儿式', duration: 40, rest: 0 },
    ],
  },
];
