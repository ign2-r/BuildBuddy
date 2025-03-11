'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';

interface PCSelectionProps {
    setIsDrawerOpen: (open: boolean) => void;
}

const PCSelection: React.FC<PCSelectionProps> = ({ setIsDrawerOpen }) => {
    const [step, setStep] = useState(1);
    const [pcConfig, setPcConfig] = useState({
        purpose: "",
        systemType: "",
        cpu: "",
        gpu: "",
        storage: "",
    });

    const handleSelection = (key: string, value: string) => {
        setPcConfig((prev) => ({ ...prev, [key]: value }));
        setStep(step + 1);
    };

    const goBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}
        >
            <Paper 
                sx={{ 
                    p: 4, 
                    borderRadius: 3, 
                    bgcolor: '#252525', 
                    color: 'white', 
                    boxShadow: 3, 
                    textAlign: 'center',
                    position: 'relative',
                    width: '500px',
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {/* Back Button */}
                {step > 1 && (
                    <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                        <Button variant="outlined" onClick={goBack}>
                            ← Back
                        </Button>
                    </Box>
                )}

                {/* Open Shopping List Button (Top Right) */}
                <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                    <Button variant="contained" color="secondary" onClick={() => setIsDrawerOpen(true)}>
                        Shopping List
                    </Button>
                </Box>

                {/* Content (Step-based Selection) */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                    {step === 1 && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>What do you need a PC for?</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" onClick={() => handleSelection('purpose', 'Gaming')}>Gaming</Button>
                                <Button variant="contained" onClick={() => handleSelection('purpose', 'Work')}>Work/Business</Button>
                                <Button variant="contained" onClick={() => handleSelection('purpose', 'General')}>General Use</Button>
                                <Button variant="contained" onClick={() => handleSelection('purpose', 'Server')}>Server/Hosting</Button>
                            </Stack>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default PCSelection;
