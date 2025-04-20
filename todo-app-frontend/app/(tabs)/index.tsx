import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { FAB, Card, Chip, Button, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { useState, useEffect, useRef } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { todoApi } from '@/config/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const PRIORITIES = ['low', 'medium', 'high'] as const;
const CATEGORIES = ['general', 'work', 'personal'] as const;

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

const AnimatedCard = Animatable.createAnimatableComponent(Card);

export default function HomeScreen() {
  const categoryScrollRef = useRef<ScrollView>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodoCategory, setNewTodoCategory] = useState<string>('general');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('general');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isFinishedExpanded, setIsFinishedExpanded] = useState(false);

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

  const startEditingTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditCategory(todo.category);
    setEditPriority(todo.priority);
    setEditModalVisible(true);
  };

  const updateTodo = async () => {
    if (!editingTodo || !editTitle.trim()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await todoApi.updateTodo(editingTodo.id, {
        title: editTitle,
        category: editCategory,
        priority: editPriority,
      });
      setTodos(todos.map(t => (t.id === editingTodo.id ? response.data : t)));
      setEditModalVisible(false);
      showToast('success', 'Task updated successfully');
    } catch (error) {
      showToast('error', 'Failed to update task');
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

  const getFilteredTodos = () => {
    let filtered = selectedCategory === 'all' 
      ? todos 
      : todos.filter(todo => todo.category === selectedCategory);
    
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return {
      activeTodos: filtered.filter(todo => !todo.completed),
      completedTodos: filtered.filter(todo => todo.completed)
    };
  };

  const handleHorizontalScroll = (event: any) => {
    const { nativeEvent } = event;
    if (Math.abs(nativeEvent.velocity.x) > 0.5) { // Detect significant horizontal swipe
      const currentIndex = CATEGORIES.indexOf(selectedCategory as any);
      const allCategories = ['all', ...CATEGORIES];
      const currentAllIndex = allCategories.indexOf(selectedCategory);
      
      if (nativeEvent.velocity.x < 0) { // Swipe left
        const nextIndex = Math.min(currentAllIndex + 1, allCategories.length - 1);
        setSelectedCategory(allCategories[nextIndex]);
      } else { // Swipe right
        const prevIndex = Math.max(currentAllIndex - 1, 0);
        setSelectedCategory(allCategories[prevIndex]);
      }
      
      // Scroll to the selected chip
      categoryScrollRef.current?.scrollTo({
        x: currentAllIndex * 100, // Approximate width of each chip
        animated: true
      });
    }
  };

  const renderItem = ({ item, index }: { item: Todo; index: number }) => (
    <AnimatedCard 
      style={[styles.todoItem, { 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
        borderWidth: colorScheme === 'light' ? 1 : 0,
      }]}
      mode="elevated"
      animation="fadeIn"
      delay={index * 100}
      elevation={2}
    >
      <View style={styles.todoContent}>
        <TouchableOpacity
          style={styles.todoHeader}
          onPress={() => toggleTodo(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox, 
            { 
              borderColor: getPriorityColor(item.priority),
              backgroundColor: item.completed ? getPriorityColor(item.priority) : 'transparent'
            }
          ]}>
            {item.completed && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <ThemedText style={[
            styles.todoText,
            item.completed && styles.completedTodoText
          ]}>
            {item.title}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.todoFooter}>
          <View style={styles.metadataContainer}>
            <Chip 
              style={[styles.categoryChip, { 
                backgroundColor: colorScheme === 'light' ? colors.chipBackground : colors.todoItem 
              }]}
              textStyle={[styles.chipText, { color: colors.text }]}
              icon={() => <Ionicons name="folder-outline" size={16} color={colors.tint} />}
            >
              {item.category}
            </Chip>
            <Chip 
              style={[styles.priorityChip, { 
                backgroundColor: getPriorityColor(item.priority) 
              }]}
              textStyle={[styles.chipText, { color: '#ffffff' }]}
              icon={() => (
                <Ionicons 
                  name={item.priority === 'high' ? 'alert-circle' : item.priority === 'medium' ? 'time' : 'leaf'} 
                  size={16} 
                  color="#ffffff" 
                />
              )}
            >
              {item.priority}
            </Chip>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => startEditingTodo(item)}
              style={[styles.actionButton, { backgroundColor: colors.chipBackground }]}
            >
              <Ionicons name="pencil" size={20} color={colors.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTodo(item.id)}
              style={[styles.actionButton, { backgroundColor: colors.chipBackground }]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
          inputStyle={{ color: colors.text }}
          iconColor={colors.text}
          placeholderTextColor={colors.icon}
        />
      </View>

      <View style={[styles.categoryContainer, { backgroundColor: colors.background }]}>
        <ScrollView 
          ref={categoryScrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          snapToInterval={100} // Approximate width of each chip
          decelerationRate="fast"
          contentContainerStyle={styles.categoryScrollContent}
        >
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.filterCategoryChip,
              { 
                backgroundColor: selectedCategory === 'all' ? colors.tint : colors.chipBackground
              }
            ]}
            textStyle={{ color: selectedCategory === 'all' ? '#fff' : colors.text }}
          >
            All
          </Chip>
          {CATEGORIES.map(category => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterCategoryChip,
                { 
                  backgroundColor: selectedCategory === category ? colors.tint : colors.chipBackground
                }
              ]}
              textStyle={{ color: selectedCategory === category ? '#fff' : colors.text }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.listContainer}>
          {/* Active Tasks Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tasks</ThemedText>
            {getFilteredTodos().activeTodos.map((item, index) => (
              <View key={item.id}>
                {renderItem({ item, index })}
              </View>
            ))}
            {getFilteredTodos().activeTodos.length === 0 && (
              <ThemedText style={styles.emptySection}>No active tasks</ThemedText>
            )}
          </View>

          {/* Finished Tasks Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              onPress={() => setIsFinishedExpanded(!isFinishedExpanded)}
              style={styles.finishedHeader}
            >
              <ThemedText style={styles.sectionTitle}>Finished</ThemedText>
              <Ionicons 
                name={isFinishedExpanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
            
            {isFinishedExpanded && (
              <>
                {getFilteredTodos().completedTodos.map((item, index) => (
                  <View key={item.id}>
                    {renderItem({ item, index })}
                  </View>
                ))}
                {getFilteredTodos().completedTodos.length === 0 && (
                  <ThemedText style={styles.emptySection}>No finished tasks</ThemedText>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

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
              <ThemedText style={styles.modalSectionTitle}>Category</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    selected={newTodoCategory === category}
                    onPress={() => setNewTodoCategory(category)}
                    style={[styles.categoryChip, { backgroundColor: newTodoCategory === category ? colors.tint : colors.todoItem }]}
                    textStyle={[styles.chipText, { color: newTodoCategory === category ? '#fff' : textColor }]}
                    icon={() => (
                      <View style={styles.chipIconContainer}>
                        <Ionicons 
                          name={
                            category === 'work' ? 'briefcase-outline' :
                            category === 'personal' ? 'person-outline' : 
                            'folder-outline'
                          } 
                          size={16} 
                          color={newTodoCategory === category ? '#fff' : colors.tint}
                        />
                      </View>
                    )}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Priority</ThemedText>
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
                    textStyle={[styles.chipText, { color: newTodoPriority === priority ? '#fff' : textColor }]}
                    icon={() => (
                      <View style={styles.chipIconContainer}>
                        <Ionicons 
                          name={
                            priority === 'high' ? 'alert-circle' : // Changed from 'warning-outline' to 'alert-circle'
                            priority === 'medium' ? 'time-outline' : 
                            'leaf-outline'
                          } 
                          size={16} 
                          color={newTodoPriority === priority ? '#fff' : colors.text}
                        />
                      </View>
                    )}
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

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            animation="slideInUp"
            style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
          >
            <ThemedText style={styles.modalTitle}>Edit Task</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.todoItem,
                  color: textColor,
                  borderColor: colors.inputBorder
                }
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
              placeholderTextColor={colors.icon}
            />

            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Category</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    selected={editCategory === category}
                    onPress={() => setEditCategory(category)}
                    style={[styles.categoryChip, { backgroundColor: editCategory === category ? colors.tint : colors.todoItem }]}
                    textStyle={[styles.chipText, { color: editCategory === category ? '#fff' : textColor }]}
                    icon={() => (
                      <View style={styles.chipIconContainer}>
                        <Ionicons 
                          name={
                            category === 'work' ? 'briefcase-outline' :
                            category === 'personal' ? 'person-outline' : 
                            'folder-outline'
                          } 
                          size={16} 
                          color={editCategory === category ? '#fff' : colors.tint}
                        />
                      </View>
                    )}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Priority</ThemedText>
              <View style={styles.priorityContainer}>
                {PRIORITIES.map(priority => (
                  <Chip
                    key={priority}
                    selected={editPriority === priority}
                    onPress={() => setEditPriority(priority)}
                    style={[
                      styles.priorityChip,
                      { backgroundColor: editPriority === priority ? getPriorityColor(priority) : colors.todoItem }
                    ]}
                    textStyle={[styles.chipText, { color: editPriority === priority ? '#fff' : textColor }]}
                    icon={() => (
                      <View style={styles.chipIconContainer}>
                        <Ionicons 
                          name={
                            priority === 'high' ? 'alert-circle' :
                            priority === 'medium' ? 'time-outline' : 
                            'leaf-outline'
                          } 
                          size={16} 
                          color={editPriority === priority ? '#fff' : colors.text}
                        />
                      </View>
                    )}
                  >
                    {priority}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={updateTodo}
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                disabled={!editTitle.trim()}
              >
                Save Changes
              </Button>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  mainScroll: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Add padding for FAB
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    zIndex: 1,
    elevation: 1,
    position: 'relative',
  },
  categoryScrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  filterCategoryChip: {
    marginRight: 8,
    height: 32,
    borderRadius: 16,
  },
  todoItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  todoContent: {
    padding: 16,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  todoFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryChip: {
    borderRadius: 16,
    height: 28,
    marginRight: 8,
    paddingHorizontal: 8,
  },
  priorityChip: {
    borderRadius: 16,
    height: 28,
    paddingHorizontal: 8,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    borderRadius: 16,
    elevation: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySection: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  chipIconContainer: {
    marginRight: 4,
  },
  finishedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
