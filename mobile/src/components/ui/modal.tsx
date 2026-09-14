import React, { useEffect, useRef, useState } from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { theme } from "./theme";
import { Icons } from "./icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: any;
  footer?: any;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
}) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
      if (callback) callback();
    });
  };

  if (!modalVisible && !visible) return null;

  return (
    <RNModal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={() => handleDismiss()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleDismiss()}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
          <View style={{ maxHeight: "100%" }}>
            <View style={styles.header}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.title}>{title}</Text>
                {description ? <Text style={styles.description}>{description}</Text> : null}
              </View>
              <TouchableOpacity
                onPress={() => handleDismiss()}
                style={styles.closeButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Icons.X size={18} color={theme.colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} bounces={true}>
              {children}
            </ScrollView>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg * 1.5,
    borderTopRightRadius: theme.radius.lg * 1.5,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
    lineHeight: 16,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "android" ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    gap: 8,
  },
});

