import React from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { spacing } from "../constants/theme";

interface ListContainerProps<T> {
  data: T[];
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function ListContainer<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ListEmptyComponent,
}: ListContainerProps<T>) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    contentContainer: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
  });

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}
