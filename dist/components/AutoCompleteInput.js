"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const AutoCompleteInput = ({ value, onChangeText, suggestions, placeholder, style, inputStyle, maxSuggestions = 5, onSuggestionPress, }) => {
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    const [filteredSuggestions, setFilteredSuggestions] = (0, react_1.useState)([]);
    const handleTextChange = (0, react_1.useCallback)((text) => {
        onChangeText(text);
        if (text.length > 0) {
            const filtered = suggestions
                .filter(suggestion => suggestion.toLowerCase().includes(text.toLowerCase()))
                .slice(0, maxSuggestions);
            setFilteredSuggestions(filtered);
        }
        else {
            setFilteredSuggestions([]);
        }
    }, [suggestions, maxSuggestions]);
    const handleSuggestionPress = (0, react_1.useCallback)((suggestion) => {
        onChangeText(suggestion);
        setFilteredSuggestions([]);
        onSuggestionPress === null || onSuggestionPress === void 0 ? void 0 : onSuggestionPress(suggestion);
    }, [onChangeText, onSuggestionPress]);
    return (<react_native_1.View style={[styles.container, style]}>
      <react_native_1.TextInput value={value} onChangeText={handleTextChange} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)} placeholder={placeholder} style={[styles.input, inputStyle]}/>
      {isFocused && filteredSuggestions.length > 0 && (<react_native_1.FlatList data={filteredSuggestions} keyExtractor={(item) => item} style={styles.suggestionsList} keyboardShouldPersistTaps="always" renderItem={({ item }) => (<react_native_1.TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
              <react_native_1.Text style={styles.suggestionText}>{item}</react_native_1.Text>
            </react_native_1.TouchableOpacity>)}/>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        position: 'relative',
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        fontSize: 16,
    },
    suggestionsList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        maxHeight: 200,
        backgroundColor: theme_1.theme.colors.surface,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        zIndex: 1000,
    },
    suggestionItem: {
        padding: theme_1.theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
    },
});
exports.default = AutoCompleteInput;
