import { Modal, Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Bouton de confirmation en rouge (action destructive). */
  destructive?: boolean;
}

interface Props extends ConfirmOptions {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Boîte de confirmation multiplateforme.
 * `Alert.alert` de react-native-web est un no-op ({}), donc on ne s'appuie
 * jamais dessus pour une action bloquante — on passe par ce composant.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, radius, spacing } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'rgba(8, 6, 24, 0.55)',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            alignSelf: 'center',
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.sm,
          }}
        >
          <Text variant="heading">{title}</Text>
          {message ? <Text muted>{message}</Text> : null}
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
            />
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
