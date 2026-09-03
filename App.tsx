import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Task = {
  id: number;
  title: string;
  category: string;
  time: string;
  xp: number;
  priority: 'Alta' | 'Média' | 'Baixa';
  done: boolean;
};

const initialTasks: Task[] = [
  { id: 1, title: 'Revisar o capítulo de poções', category: 'Estudos', time: '25 min', xp: 40, priority: 'Alta', done: false },
  { id: 2, title: 'Responder mensagens da guilda', category: 'Pessoal', time: '15 min', xp: 25, priority: 'Média', done: true },
  { id: 3, title: 'Planejar a semana', category: 'Organização', time: '30 min', xp: 35, priority: 'Alta', done: false },
  { id: 4, title: 'Caminhada de recuperação', category: 'Bem-estar', time: '20 min', xp: 30, priority: 'Baixa', done: false },
];

const colors = {
  ink: '#25221d',
  muted: '#736c60',
  paper: '#f6f1e8',
  line: '#e3dacb',
  plum: '#403243',
  gold: '#c38b32',
  sage: '#778b72',
};

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState('Hoje');
  const [showComposer, setShowComposer] = useState(false);
  const [newTask, setNewTask] = useState('');
  const completed = tasks.filter((task) => task.done).length;
  const earnedXp = tasks.filter((task) => task.done).reduce((total, task) => total + task.xp, 0);

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function addTask() {
    if (!newTask.trim()) return;
    setTasks((current) => [...current, { id: Date.now(), title: newTask.trim(), category: 'Nova missão', time: '15 min', xp: 30, priority: 'Média', done: false }]);
    setNewTask('');
    setShowComposer(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>TERÇA-FEIRA, 02 DE SETEMBRO</Text>
            <Text style={styles.title}>Bom dia, João.</Text>
            <Text style={styles.subtitle}>Seu próximo passo aguarda no grimório.</Text>
          </View>
          <Pressable style={styles.avatar} onPress={() => setActiveTab('Perfil')}><Text style={styles.avatarText}>JG</Text></Pressable>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.moon}><Text style={styles.moonText}>☾</Text></View>
          <View style={styles.streakCopy}>
            <Text style={styles.streakLabel}>SEQUÊNCIA ATUAL</Text>
            <Text style={styles.streakValue}>7 dias <Text style={styles.streakAccent}>em ascensão</Text></Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '68%' }]} /></View>
          </View>
          <Text style={styles.streakNumber}>+{earnedXp || 15}<Text style={styles.xpSmall}> XP</Text></Text>
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.sectionTitle}>Missão do dia</Text><Text style={styles.sectionHint}>{completed} de {tasks.length} rituais concluídos</Text></View>
          <Text style={styles.percent}>{Math.round((completed / tasks.length) * 100)}%</Text>
        </View>
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}><Text style={styles.iconText}>✦</Text></View>
          <View style={styles.missionCopy}><Text style={styles.missionTitle}>Acenda 3 chamas hoje</Text><Text style={styles.missionHint}>Complete tarefas para receber a recompensa</Text></View>
          <View style={styles.reward}><Text style={styles.rewardValue}>+100</Text><Text style={styles.rewardLabel}>XP</Text></View>
        </View>

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Suas tarefas</Text><Text style={styles.sectionHint}>Quarta-feira, 02 de setembro</Text></View><Pressable onPress={() => setShowComposer(true)}><Text style={styles.seeAll}>+ Nova</Text></Pressable></View>
        <View style={styles.tabs}>{['Hoje', 'Próximas', 'Concluídas'].map((tab) => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}><Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text></Pressable>)}</View>

        {activeTab === 'Concluídas' ? tasks.filter((task) => task.done).map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} />) : activeTab === 'Próximas' ? <View style={styles.empty}><Text style={styles.emptyGlyph}>◌</Text><Text style={styles.emptyTitle}>O futuro ainda está em branco</Text><Text style={styles.emptyText}>Novas tarefas aparecerão aqui.</Text></View> : tasks.filter((task) => !task.done).map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} />)}

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Seu círculo de poder</Text><Text style={styles.sectionHint}>Nível 4 · Aprendiz da Aurora</Text></View><Text style={styles.seeAll}>Ver perfil</Text></View>
        <View style={styles.levelCard}><View style={styles.levelBadge}><Text style={styles.levelNumber}>IV</Text></View><View style={styles.levelCopy}><Text style={styles.levelTitle}>Aprendiz da Aurora</Text><Text style={styles.levelHint}>{earnedXp + 340} / 500 XP para o próximo nível</Text><View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${Math.min(100, ((earnedXp + 340) / 500) * 100)}%` }]} /></View></View><Text style={styles.levelArrow}>›</Text></View>
      </ScrollView>
      {showComposer && <View style={styles.overlay}><View style={styles.composer}><Text style={styles.composerTitle}>Inscrever nova missão</Text><Text style={styles.composerHint}>Que tarefa deseja registrar no grimório?</Text><TextInput autoFocus value={newTask} onChangeText={setNewTask} placeholder="Ex.: estudar para a prova" placeholderTextColor="#9b9182" style={styles.input} /><View style={styles.composerActions}><Pressable onPress={() => setShowComposer(false)}><Text style={styles.cancel}>Cancelar</Text></Pressable><Pressable onPress={addTask} style={styles.addButton}><Text style={styles.addButtonText}>Adicionar ✦</Text></Pressable></View></View></View>}
      <View style={styles.bottomNav}>{[['⌂', 'Hoje'], ['◈', 'Rituais'], ['◉', 'Foco'], ['☷', 'Arquivo']].map(([icon, label]) => <Pressable key={label} onPress={() => setActiveTab(label)} style={styles.navItem}><Text style={[styles.navIcon, activeTab === label && styles.navActive]}>{icon}</Text><Text style={[styles.navLabel, activeTab === label && styles.navActive]}>{label}</Text></Pressable>)}</View>
    </View>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  return <Pressable style={styles.taskRow} onPress={() => onToggle(task.id)}><View style={[styles.check, task.done && styles.checked]}>{task.done && <Text style={styles.checkmark}>✓</Text>}</View><View style={styles.taskCopy}><Text style={[styles.taskTitle, task.done && styles.doneText]}>{task.title}</Text><Text style={styles.taskMeta}>{task.category}  ·  {task.time}</Text></View><View style={styles.taskReward}><Text style={styles.taskXp}>+{task.xp}</Text><Text style={styles.xpLabel}>XP</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: { padding: 24, paddingTop: 56, paddingBottom: 108 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  eyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 9 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: colors.plum, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#c29b59' },
  avatarText: { color: '#f3d9a0', fontWeight: '800', fontSize: 13 },
  streakCard: { backgroundColor: colors.plum, borderRadius: 14, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 29 },
  moon: { width: 42, height: 42, borderRadius: 22, backgroundColor: '#5c4b5d', justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  moonText: { color: '#f3d9a0', fontSize: 27, lineHeight: 31 },
  streakCopy: { flex: 1 }, streakLabel: { color: '#bdb0be', fontSize: 9, letterSpacing: 1.3, fontWeight: '800' },
  streakValue: { color: '#fff8e9', fontSize: 16, fontWeight: '700', marginTop: 4 }, streakAccent: { color: '#dcb66e', fontSize: 11, fontWeight: '500' },
  progressTrack: { height: 5, backgroundColor: '#66566a', borderRadius: 4, marginTop: 10 }, progressFill: { height: 5, backgroundColor: '#d7a943', borderRadius: 4 },
  streakNumber: { color: '#eacb8c', fontSize: 16, fontWeight: '800', marginLeft: 10 }, xpSmall: { fontSize: 9 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' }, sectionHint: { color: colors.muted, fontSize: 11, marginTop: 4 }, percent: { color: colors.gold, fontWeight: '800', fontSize: 16 }, seeAll: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  missionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffaf1', borderWidth: 1, borderColor: '#ead8b5', borderRadius: 12, padding: 13, marginBottom: 28 }, missionIcon: { width: 37, height: 37, borderRadius: 20, backgroundColor: '#f2dfb7', justifyContent: 'center', alignItems: 'center', marginRight: 11 }, iconText: { color: colors.gold, fontSize: 19 }, missionCopy: { flex: 1 }, missionTitle: { fontWeight: '800', color: colors.ink, fontSize: 13 }, missionHint: { fontSize: 10, color: colors.muted, marginTop: 4 }, reward: { alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#ead8b5', paddingLeft: 12 }, rewardValue: { color: colors.gold, fontSize: 14, fontWeight: '900' }, rewardLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 5 }, tab: { paddingVertical: 9, marginRight: 22 }, activeTab: { borderBottomWidth: 2, borderBottomColor: colors.plum }, tabText: { fontSize: 12, color: colors.muted, fontWeight: '600' }, activeTabText: { color: colors.plum, fontWeight: '800' },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line }, check: { width: 22, height: 22, borderRadius: 12, borderWidth: 1.5, borderColor: '#b9ae9e', justifyContent: 'center', alignItems: 'center', marginRight: 12 }, checked: { backgroundColor: colors.sage, borderColor: colors.sage }, checkmark: { color: '#fff', fontWeight: '900', fontSize: 13 }, taskCopy: { flex: 1 }, taskTitle: { color: colors.ink, fontSize: 13, fontWeight: '700' }, doneText: { textDecorationLine: 'line-through', color: colors.muted }, taskMeta: { color: colors.muted, fontSize: 10, marginTop: 5 }, taskReward: { alignItems: 'flex-end', marginLeft: 8 }, taskXp: { color: colors.gold, fontWeight: '800', fontSize: 13 }, xpLabel: { color: colors.muted, fontSize: 8, marginTop: 2 },
  levelCard: { marginTop: 2, backgroundColor: '#ebe5da', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center' }, levelBadge: { width: 43, height: 43, borderRadius: 23, backgroundColor: colors.plum, justifyContent: 'center', alignItems: 'center', marginRight: 12 }, levelNumber: { color: '#e7c77e', fontSize: 16, fontWeight: '900' }, levelCopy: { flex: 1 }, levelTitle: { color: colors.ink, fontWeight: '800', fontSize: 13 }, levelHint: { color: colors.muted, fontSize: 10, marginTop: 4 }, levelTrack: { height: 4, backgroundColor: '#d2c8b8', borderRadius: 3, marginTop: 8 }, levelFill: { height: 4, backgroundColor: colors.gold, borderRadius: 3 }, levelArrow: { color: colors.muted, fontSize: 25, marginLeft: 10 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 77, backgroundColor: '#fffaf1', borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 }, navItem: { alignItems: 'center', width: 70 }, navIcon: { fontSize: 20, color: '#aa9f91', height: 26 }, navLabel: { fontSize: 10, color: '#aa9f91', fontWeight: '600' }, navActive: { color: colors.plum, fontWeight: '900' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(37, 34, 29, 0.48)', justifyContent: 'flex-end' }, composer: { backgroundColor: colors.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 24, paddingBottom: 34 }, composerTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' }, composerHint: { color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 18 }, input: { backgroundColor: '#fffaf1', borderWidth: 1, borderColor: colors.line, borderRadius: 9, padding: 14, color: colors.ink, fontSize: 14 }, composerActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18 }, cancel: { color: colors.muted, fontSize: 13, fontWeight: '700', marginRight: 20 }, addButton: { backgroundColor: colors.plum, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 }, addButtonText: { color: '#f7e4b5', fontWeight: '800', fontSize: 13 }, empty: { alignItems: 'center', paddingVertical: 45 }, emptyGlyph: { color: colors.gold, fontSize: 32 }, emptyTitle: { color: colors.ink, fontWeight: '800', marginTop: 10 }, emptyText: { color: colors.muted, fontSize: 12, marginTop: 5 },
});
