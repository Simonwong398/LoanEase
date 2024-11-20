import React, { useCallback } from 'react';
import { View, ViewToken, VirtualizedList as RNVirtualizedList } from 'react-native';
import { theme } from '../theme/theme';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  itemHeight: number;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  onViewableItemsChanged,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
}: VirtualizedListProps<T>) {
  const getItem = useCallback((data: T[], index: number) => data[index], []);
  const getItemCount = useCallback((data: T[]) => data.length, []);
  const getItemLayout = useCallback(
    (_: T[] | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  return (
    <RNVirtualizedList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={keyExtractor}
      getItem={getItem}
      getItemCount={getItemCount}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={onViewableItemsChanged}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews={true}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
      style={{ flex: 1 }}
    />
  );
}

export default React.memo(VirtualizedList); 