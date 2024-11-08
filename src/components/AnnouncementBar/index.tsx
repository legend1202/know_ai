import React, { useState } from 'react';
import { Box, Text, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  const handleClose = () => {
    setIsVisible(false); // Function to hide the announcement bar
  };

  if (!isVisible) {
    return null; // Don't render the component if it's not visible
  }

  return (
    <Box 
      bg="primary.80" 
      color="white" 
      p={0.5} 
      textAlign="center" 
      fontSize="8px" 
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="banner"
    >
      <Text fontSize="sm" fontWeight="bold">
        The Assistants suffered a bug with uploaded Local Files. We ask you to create the impacted assistants again. Thank you.
      <IconButton 
        aria-label="Close announcement" 
        icon={<CloseIcon />} 
        position="absolute" // Position the button inside the Box
        top="1px" // Adjust these values as needed
        right="1px"
        size="xs"
        onClick={handleClose}
      />
            </Text>

    </Box>
  );
};

export default AnnouncementBar;
