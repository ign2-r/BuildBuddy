'use client';

import { Box, Typography, Button, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import Chatbot from '@/components/Chatbot';
import Navbar from '@/components/Navbar';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

const steps = [
    {
        label: 'Install CPU',
        description: `Lift the CPU socket lever on the motherboard. Align the triangle on the CPU with the triangle on the socket. Gently place the CPU in without forcing it, then lower and lock the lever.`,
        query: 'how to install a CPU',
    },
    {
        label: 'Apply Thermal Paste',
        description: `If your CPU cooler does not have pre-applied thermal paste, apply a pea-sized dot of thermal paste in the center of the CPU.`,
        query: 'how to apply thermal paste to CPU',
    },
    {
        label: 'Install CPU Cooler',
        description: `Mount the CPU cooler on top of the CPU. Align and secure it using the provided bracket or push pins. Plug the fan cable into the CPU_FAN header.`,
        query: 'how to install a cpu cooler',
    },
    {
        label: 'Install RAM',
        description: `Open the RAM slot latches. Align the notch in the RAM stick with the slot and press down firmly until it clicks into place.`,
        query: 'how to install RAM',
    },
    {
        label: 'Install Storage (SSD/HDD)',
        description: `For M.2: Insert it into the M.2 slot at a slight angle and screw it down. For SATA: Mount the drive in a 2.5" or 3.5" bay, connect a SATA power cable from the PSU, and a SATA data cable to the motherboard.`,
        query: 'how to install SSD or HDD',
    },
    {
        label: 'Mount Motherboard into Case',
        description: `Install standoffs in the case to match your motherboard layout. Carefully place the motherboard on the standoffs and screw it down.`,
        query: 'how to install motherboard in pc case',
    },
    {
        label: 'Install Power Supply (PSU)',
        description: `Insert the PSU into the case (typically at the bottom rear). Screw it in place and begin routing cables through the back.`,
        query: 'how to install power supply in pc',
    },
    {
        label: 'Connect Power Cables',
        description: `Connect the 24-pin motherboard, 8-pin CPU, and PCIe (if needed) power cables. Route cables behind the case for better airflow.`,
        query: 'how to connect power cables pc build',
    },
    {
        label: 'Install GPU',
        description: `Insert the GPU into the top PCIe x16 slot on the motherboard. Secure it with a screw and connect any required PCIe power cables.`,
        query: 'how to install graphics card',
    },
    {
        label: 'Double Check and Boot',
        description: `Double-check all connections, especially power cables and front panel connectors. Plug into a monitor, keyboard, and power. Turn it on and check for POST.`,
        query: 'how to boot pc for the first time after building',
    },
    {
        label: 'Enjoy Your Build!',
        description: `Congrats — you’ve completed your PC build! Install your OS, update drivers, and start gaming, working, or creating.`,
        query: 'what to do after building a pc',
        isFinal: true,
    },
];

export default function BuildGuidePage() {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        const next = activeStep + 1;
        setActiveStep(next);

        if (steps[next]?.isFinal) {
            toast.success('🎉 Build complete! Enjoy your new PC!', {
                position: 'top-center',
                autoClose: 5000,
            });

            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
            });
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
            <ToastContainer />

            <Box display="flex" flexGrow={1} minHeight={0} sx={{ p: 3, bgcolor: '#121212' }}>
                <Box
                    sx={{
                        width: '50%',
                        height: '100%',
                        bgcolor: '#1E1E1E',
                        color: 'white',
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 3,
                        overflowY: 'auto',
                        mr: 2,
                        minHeight: 0,
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        🛠 Build Guide
                    </Typography>

                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    <Typography sx={{ color: step.isFinal ? '#81c784' : 'white' }}>{step.label}</Typography>
                                </StepLabel>
                                <StepContent>
                                    <Typography sx={{ color: step.isFinal ? '#81c784' : 'white', mb: 2 }}>
                                        {step.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        {!step.isFinal && (
                                            <Button variant="contained" onClick={handleNext} color="primary">
                                                Continue
                                            </Button>
                                        )}
                                        {index > 0 && (
                                            <Button variant="contained" onClick={handleBack} color="secondary">
                                                Back
                                            </Button>
                                        )}
                                        {!step.isFinal && (
                                            <Button
                                                variant="contained"
                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.query)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    bgcolor: '#e57373',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: '#ef5350',
                                                    },
                                                }}
                                            >
                                                Watch on YouTube
                                            </Button>
                                        )}
                                    </Box>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Box
                    sx={{
                        width: '50%',
                        height: '100%',
                        bgcolor: 'white',
                        color: 'black',
                        p: 2,
                        borderRadius: 3,
                        boxShadow: 3,
                        minHeight: 0,
                    }}
                >
                    <Chatbot />
                </Box>
            </Box>
        </Box>
    );
}
