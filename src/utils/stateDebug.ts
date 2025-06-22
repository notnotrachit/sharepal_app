/**
 * Utility functions for debugging state issues
 */

export const logStateTransition = (screenName: string, action: string, additionalData?: any) => {
  if (__DEV__) {
    console.log(`[STATE DEBUG] ${screenName} - ${action}`, additionalData);
  }
};

export const validateGroupMembers = (groupId: string, members: any[], userId?: string) => {
  if (__DEV__) {
    console.log(`[VALIDATION] Group ${groupId} members:`, members);
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      console.warn(`[VALIDATION] Group ${groupId} has no valid members`);
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
      console.warn(`[VALIDATION] Group ${groupId} has mixed or invalid member data:`, members);
      return false;
    }
    
    // If it's a string array (just user IDs), we need to fetch full member data
    if (isStringArray) {
      console.warn(`[VALIDATION] Group ${groupId} has only user IDs, need to fetch full member data`);
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
        console.warn(`[VALIDATION] Group ${groupId} member objects missing required properties:`, members);
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
        console.warn(`[VALIDATION] Current user ${userId} not found in group ${groupId} members`);
        return false;
      }
    }
    
    console.log(`[VALIDATION] Group ${groupId} members are valid`);
    return true;
  }
  
  return true;
};

export const validateSplitData = (splits: any[], groupMembers: any[]) => {
  if (__DEV__) {
    console.log(`[VALIDATION] Checking splits against group members`);
    console.log('Splits:', splits);
    console.log('Group members:', groupMembers);
    
    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      console.warn(`[VALIDATION] Invalid splits data`);
      return false;
    }
    
    if (!groupMembers || !Array.isArray(groupMembers) || groupMembers.length === 0) {
      console.warn(`[VALIDATION] Invalid group members data`);
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
      console.warn(`[VALIDATION] Found unknown users in splits:`, unknownUsers);
      console.warn(`[VALIDATION] Available member IDs:`, memberIds);
      return false;
    }
    
    console.log(`[VALIDATION] All split users are valid group members`);
    return true;
  }
  
  return true;
};

export const clearDebugConsole = () => {
  if (__DEV__) {
    console.clear();
    console.log('[STATE DEBUG] Console cleared');
  }
};
