import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';

interface AutoCompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  suggestions: string[];
  placeholder?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxSuggestions?: number;
  onSuggestionPress?: (suggestion: string) => void;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  value,
  onChangeText,
  suggestions,
  placeholder,
  style,
  inputStyle,
  maxSuggestions = 5,
  onSuggestionPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);
      if (text.length > 0) {
        const filtered = suggestions
          .filter(suggestion =>
            suggestion.toLowerCase().includes(text.toLowerCase())
          )
          .slice(0, maxSuggestions);
        setFilteredSuggestions(filtered);
      } else {
        setFilteredSuggestions([]);
      }
    },
    [suggestions, maxSuggestions]
  );

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      onChangeText(suggestion);
      setFilteredSuggestions([]);
      onSuggestionPress?.(suggestion);
    },
    [onChangeText, onSuggestionPress]
  );

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder={placeholder}
        style={[styles.input, inputStyle]}
      />
      {isFocused && filteredSuggestions.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item}
          style={styles.suggestionsList}
          keyboardShouldPersistTaps="always"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
});

export default AutoCompleteInput; 