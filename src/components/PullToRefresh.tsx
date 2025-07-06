import React, { useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  ScrollViewProps,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

interface PullToRefreshProps extends ScrollViewProps {
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  refreshing: externalRefreshing,
  children,
  ...scrollViewProps
}) => {
  const { colors } = useTheme();
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  
  const isRefreshing = externalRefreshing ?? internalRefreshing;

  const handleRefresh = async () => {
    hapticFeedback.light();
    
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }
    
    try {
      await onRefresh();
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
          title="Pull to refresh"
          titleColor={colors.textSecondary}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default PullToRefresh;