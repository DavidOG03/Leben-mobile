import { Modal, View, TouchableWithoutFeedback, Animated, KeyboardAvoidingView, Platform, PanResponder } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  containerStyle?: any;
}

export function BottomSheet({ visible, onClose, children, containerStyle }: BottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const translateY = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 1000,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  if (!showModal) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-end">
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="absolute inset-0 bg-black/60" />
          </TouchableWithoutFeedback>
          
          <Animated.View 
            style={[{ transform: [{ translateY }] }, containerStyle]}
            className="bg-leben-bg rounded-t-3xl border-t border-leben-border pt-3 pb-8 px-5 shadow-lg max-h-[90%]"
          >
            <View 
              {...panResponder.panHandlers}
              className="w-12 h-1.5 bg-leben-border rounded-full self-center mb-6" 
            />
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
