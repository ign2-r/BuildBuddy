'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';

const PCSelection = () => {
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
                {/* Back Button (Inside the Square Panel, Top-Left) */}
                {step > 1 && (
                    <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                        <Button variant="outlined" onClick={goBack}>
                            ← Back
                        </Button>
                    </Box>
                )}

                {/* Centered Content */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                    {/* Step 1: Purpose */}
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

                    {/* Step 2: System Type */}
                    {step === 2 && pcConfig.purpose && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>What type of system?</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" onClick={() => handleSelection('systemType', 'Laptop')}>Laptop</Button>
                                <Button variant="contained" onClick={() => handleSelection('systemType', 'Prebuilt')}>Prebuilt Desktop</Button>
                                <Button variant="contained" onClick={() => handleSelection('systemType', 'Custom')}>Custom Desktop</Button>
                            </Stack>
                        </>
                    )}

                    {/* Placeholder Screen for Laptops */}
                    {step === 3 && pcConfig.systemType === 'Laptop' && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                For {pcConfig.purpose}, check out these laptop listings.
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                We will soon provide recommendations tailored to {pcConfig.purpose} needs.
                            </Typography>
                            <Button variant="contained" onClick={() => alert('Feature coming soon!')}>
                                View Listings
                            </Button>
                        </>
                    )}

                    {/* Placeholder Screen for Prebuilt Desktops */}
                    {step === 3 && pcConfig.systemType === 'Prebuilt' && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>
                                For {pcConfig.purpose}, check out these prebuilt desktop listings.
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                We will soon provide recommendations tailored to {pcConfig.purpose} needs.
                            </Typography>
                            <Button variant="contained" onClick={() => alert('Feature coming soon!')}>
                                View Listings
                            </Button>
                        </>
                    )}

                    {/* Step 3: Custom Desktop Flow Continues */}
                    {step === 3 && pcConfig.systemType === 'Custom' && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>Select CPU Brand</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" onClick={() => handleSelection('cpu', 'AMD')}>AMD</Button>
                                <Button variant="contained" onClick={() => handleSelection('cpu', 'Intel')}>Intel</Button>
                            </Stack>
                        </>
                    )}

                    {step === 4 && pcConfig.systemType === 'Custom' && pcConfig.cpu && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>Select GPU Brand</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" onClick={() => handleSelection('gpu', 'NVIDIA')}>NVIDIA</Button>
                                <Button variant="contained" onClick={() => handleSelection('gpu', 'AMD')}>AMD</Button>
                                <Button variant="contained" onClick={() => handleSelection('gpu', 'Integrated')}>Integrated Graphics</Button>
                            </Stack>
                        </>
                    )}

                    {step === 5 && pcConfig.systemType === 'Custom' && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>Select Storage Type</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" onClick={() => handleSelection('storage', 'HDD')}>HDD</Button>
                                <Button variant="contained" onClick={() => handleSelection('storage', 'SATA SSD')}>SATA SSD</Button>
                                <Button variant="contained" onClick={() => handleSelection('storage', 'NVMe SSD')}>NVMe SSD</Button>
                            </Stack>
                        </>
                    )}

                    {/* Final Step: Show JSON Data */}
                    {step > 5 && (
                        <>
                            <Typography variant="h5" sx={{ mb: 2 }}>Your Selections</Typography>
                            <pre style={{ textAlign: "left", fontSize: "14px", backgroundColor: "#1e1e1e", padding: "10px", borderRadius: "5px", overflowX: "auto" }}>
                                {JSON.stringify(pcConfig, null, 2)}
                            </pre>
                            <Button variant="contained" color="success" onClick={() => alert('Preferences saved in memory!')}>
                                Finish
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default PCSelection;
