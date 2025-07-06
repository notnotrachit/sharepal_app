/**
 * Utility functions for debugging state issues
 */

export const logStateTransition = (screenName: string, action: string, additionalData?: any) => {
  if (__DEV__) {
  }
};

export const validateGroupMembers = (groupId: string, members: any[], userId?: string) => {
  if (__DEV__) {
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      return false;
    }
    
    // Check if members are strings (just user IDs) or objects (full user data)
    const isStringArray = members.every(member => typeof member === 'string');
    const isObjectArray = members.every(member => 
      member && 
      typeof member === 'object' &&
      (member.id || member._id)
    );
    
    if (!isStringArray && !isObjectArray) {
      return false;
    }
    
    // If it's a string array (just user IDs), we need to fetch full member data
    if (isStringArray) {
      return false; // This will trigger a refetch of group members
    }
    
    // For object array, validate that objects have required properties
    if (isObjectArray) {
      const hasValidMembers = members.every(member => 
        member && 
        (member.id || member._id) && 
        (member.name || member.user_name || member.email)
      );
      
      if (!hasValidMembers) {
        return false;
      }
    }
    
    if (userId) {
      const currentUserInGroup = isStringArray 
        ? members.includes(userId)
        : members.some(member => 
            (member.id === userId || member._id === userId)
          );
      
      if (!currentUserInGroup) {
        return false;
      }
    }
    
    return true;
  }
  
  return true;
};

export const validateSplitData = (splits: any[], groupMembers: any[]) => {
  if (__DEV__) {
    
    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return false;
    }
    
    if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0) {
      return false;
    }
    
    // Handle both string array (user IDs) and object array (full user data) cases
    const memberIds = groupMembers.map(m => {
      if (typeof m === 'string') {
        return m; // It's already a user ID
      }
      return m.id || m._id; // Extract ID from user object
    }).filter(Boolean); // Remove any undefined/null values
    
    const unknownUsers = splits.filter(split => 
      !memberIds.includes(split.user_id)
    );
    
    if (unknownUsers.length > 0) {
      return false;
    }
    
    return true;
  }
  
  return true;
};

export const clearDebugConsole = () => {
  if (__DEV__) {
  }
};
