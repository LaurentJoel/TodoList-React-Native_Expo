import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { FAB, Card, Chip, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';
import { todoApi } from '../config/api';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const PRIORITIES = ['low', 'medium', 'high'] as const;
const CATEGORIES = ['general', 'work', 'personal', 'shopping', 'health'] as const;

const AnimatedCard = Animatable.createAnimatableComponent(Card);

const HomeScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodoCategory, setNewTodoCategory] = useState<string>('general');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const colors = Colors[colorScheme];

  useEffect(() => {
    fetchTodos();
  }, []);

  const showToast = (type: 'success' | 'error', text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime: 3000,
      position: 'bottom',
    });
  };

  const fetchTodos = async () => {
    try {
      const response = await todoApi.getTodos();
      setTodos(response.data);
    } catch (error) {
      showToast('error', 'Failed to fetch todos', 'Please try again later');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await todoApi.createTodo(newTodo, { 
        category: newTodoCategory,
        priority: newTodoPriority
      });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setModalVisible(false);
      showToast('success', 'Task added successfully');
    } catch (error) {
      showToast('error', 'Failed to add task', 'Please try again');
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await todoApi.updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos(todos.map(t => (t.id === todo.id ? response.data : t)));
      showToast('success', todo.completed ? 'Task uncompleted' : 'Task completed');
    } catch (error) {
      showToast('error', 'Failed to update task');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await todoApi.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      showToast('success', 'Task deleted successfully');
    } catch (error) {
      showToast('error', 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.tint;
      case 'low': return colors.success;
      default: return colors.tint;
    }
  };

  const filteredTodos = selectedCategory === 'all' 
    ? todos 
    : todos.filter(todo => todo.category === selectedCategory);

  const renderItem = ({ item, index }: { item: Todo; index: number }) => (
    <AnimatedCard 
      style={[styles.todoItem, { backgroundColor: colors.cardBackground }]}
      mode="elevated"
      animation="fadeIn"
      delay={index * 100}
    >
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodo(item)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox, 
            { borderColor: getPriorityColor(item.priority) },
            item.completed && { backgroundColor: getPriorityColor(item.priority) }
          ]}>
            {item.completed && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <View style={styles.todoTextContainer}>
            <ThemedText style={[
              styles.todoText,
              item.completed && styles.completedTodoText
            ]}>
              {item.title}
            </ThemedText>
            <View style={styles.todoMetadata}>
              <Chip 
                style={[styles.chip, { backgroundColor: colors.todoItem }]}
                textStyle={{ color: textColor, fontSize: 12 }}
              >
                {item.category}
              </Chip>
              <Chip 
                style={[styles.chip, styles.lastChip, { backgroundColor: getPriorityColor(item.priority) }]}
                textStyle={{ color: '#fff', fontSize: 12 }}
              >
                {item.priority}
              </Chip>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => deleteTodo(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>My Tasks</ThemedText>
      
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={[styles.categoryChip, { backgroundColor: selectedCategory === 'all' ? colors.tint : colors.todoItem }]}
            textStyle={{ color: selectedCategory === 'all' ? '#fff' : textColor }}
          >
            All
          </Chip>
          {CATEGORIES.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, { backgroundColor: selectedCategory === category ? colors.tint : colors.todoItem }]}
              textStyle={{ color: selectedCategory === category ? '#fff' : textColor }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTodos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchTodos();
        }}
      />

      <FAB
        icon="plus"
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: colors.tint }]}
        color="#fff"
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            animation="slideInUp"
            style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
          >
            <ThemedText style={styles.modalTitle}>New Task</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.todoItem,
                  color: textColor,
                  borderColor: colors.inputBorder
                }
              ]}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.icon}
            />

            <View style={styles.modalSection}>
              <ThemedText style={styles.sectionTitle}>Category</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    selected={newTodoCategory === category}
                    onPress={() => setNewTodoCategory(category)}
                    style={[styles.categoryChip, { backgroundColor: newTodoCategory === category ? colors.tint : colors.todoItem }]}
                    textStyle={{ color: newTodoCategory === category ? '#fff' : textColor }}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <ThemedText style={styles.sectionTitle}>Priority</ThemedText>
              <View style={styles.priorityContainer}>
                {PRIORITIES.map(priority => (
                  <Chip
                    key={priority}
                    selected={newTodoPriority === priority}
                    onPress={() => setNewTodoPriority(priority)}
                    style={[
                      styles.priorityChip,
                      { backgroundColor: newTodoPriority === priority ? getPriorityColor(priority) : colors.todoItem }
                    ]}
                    textStyle={{ color: newTodoPriority === priority ? '#fff' : textColor }}
                  >
                    {priority}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={addTodo}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                disabled={!newTodo.trim()}
              >
                Add Task
              </Button>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
    height: 32,
  },
  todoItem: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    marginBottom: 4,
  },
  todoMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 28,
    marginRight: 8,
    paddingHorizontal: 8,
    flexShrink: 1,
  },
  lastChip: {
    marginRight: 0,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    minWidth: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
});

export default HomeScreen;