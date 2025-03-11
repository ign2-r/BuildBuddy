'use client';

import { useState } from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import Image from 'next/image';
import PCSelection from '../../components/PCSelection';
import Chatbot from '../../components/Chatbot';
import ShoppingListDrawer from '../../components/ShoppingListDrawer';

export default function HomePage() {
    const [showPCSelection, setShowPCSelection] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <Box display="flex" height="100vh" sx={{ p: 3, bgcolor: '#121212' }}>
            {/* Chatbot Panel (1/4 of Screen) */}
            <Paper
                elevation={3}
                sx={{
                    width: '25%',
                    bgcolor: 'white',
                    color: 'black',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    mr: 2
                }}
            >
                <Chatbot />
            </Paper>

            {/* Main Content (3/4 of Screen) */}
            <Box
                sx={{
                    flex: 1,
                    bgcolor: '#1E1E1E',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 3
                }}
            >
                {!showPCSelection ? (
                    <>
                        <Paper
                            elevation={4}
                            sx={{
                                p: 4,
                                borderRadius: 4,
                                bgcolor: '#252525',
                                color: 'white',
                                boxShadow: 3,
                                maxWidth: '500px',
                                textAlign: 'center',
                                mb: 3
                            }}
                        >
                            {/* Logo + Title */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Image src="/favicon.ico" alt="BuildBuddy Logo" width={50} height={50} />
                                <Typography variant="h4" component="h1" fontWeight={600}>
                                    BuildBuddy AI
                                </Typography>
                            </Box>

                            <Typography variant="h6" paragraph fontWeight={400}>
                                Your AI-powered assistant for building the perfect PC.
                            </Typography>

                            {/* Buttons */}
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setShowPCSelection(true)} 
                                    sx={{ borderRadius: 3, px: 3, py: 1 }}
                                >
                                    Get Started
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setIsDrawerOpen(true)}
                                    sx={{ borderRadius: 3, px: 3, py: 1 }}
                                >
                                    Open Shopping List
                                </Button>
                            </Stack>
                        </Paper>
                    </>
                ) : (
                    <PCSelection setIsDrawerOpen={setIsDrawerOpen} />
                )}
            </Box>

            {/* Shopping List Drawer */}
            <ShoppingListDrawer isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
        </Box>
    );
}
