import { Box, Text } from '@mantine/core';
import { keyframes } from '@emotion/react';

export enum AudioProcessingStatus {
  INITIALIZING = 'Initializing',
  FETCHING = 'Fetching',
  QUEUED = 'Queued',
  CONVERTING = 'Converting',
  FINALIZING = 'Finalizing',
}

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.3; }
`;

interface AudioLoaderProps {
  status: AudioProcessingStatus;
}

export function AudioLoader({ status }: AudioLoaderProps) {
  return (
    <Box
      style={{
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '8px',
        margin: '10px 0'
      }}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          flexDirection: 'column'
        }}
      >
        <Box
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#228be6',
            borderRadius: '50%',
            animation: `${pulse} 1.5s ease-in-out infinite`
          }}
        />
        <Text size="sm" style={{
          fontWeight: 'extrabold',
          alignItems: 'center',
        }} >
          {status}
        </Text>
      </Box>
    </Box>
  );
}
