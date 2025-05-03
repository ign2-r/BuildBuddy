'use client';

import { Box, Typography, Button, Stepper, Step, StepLabel, StepContent, Paper, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery, IconButton, Drawer } from '@mui/material';
import Chatbot from '@/components/Chatbot';
import { useState, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';

const requiredTools = [
  'Phillips-head screwdriver (#2)',
  'Anti-static wristband (recommended)',
  'Clean, well-lit workspace with hard surface',
  'Small container for screws',
  'Zip ties for cable management',
  'Thermal paste (if not pre-applied on your cooler)',
];

// Type for step
type StepType = {
    label: string;
    description: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
    time: string;
    warnings?: string[];
    tips?: string[];
    query: string;
    isFinal?: boolean;
};

const steps: StepType[] = [
    {
        label: 'Prepare Your Workspace',
        description: `Set up in a static-free environment with plenty of light and space. Unbox your components carefully and place them on their anti-static bags. Put on an anti-static wristband if available and attach it to a metal part of your case.`,
        difficulty: 'Easy',
        time: '10 minutes',
        warnings: [
            'Never build on carpet or while standing on carpet',
            'Remove rings, watches, and metal jewelry',
            'Keep drinks and liquids away from components',
        ],
        tips: [
            'Organize small screws in separate containers',
            'Keep manuals handy for reference',
            'Take your time and don\'t rush',
        ],
        query: 'how to prepare for pc building',
    },
    {
        label: 'Install CPU',
        description: `Locate the CPU socket on your motherboard and carefully lift the retention arm. Look for the golden triangle on your CPU and align it with the triangle on the socket. Gently place the CPU onto the socket WITHOUT pressing down (it should drop in with zero force). Lower the retention arm to lock it in place.`,
        difficulty: 'Moderate',
        time: '5 minutes',
        warnings: [
            'Never touch the gold pins on the CPU or socket',
            'Don\'t force the CPU – it should fit with no pressure',
            'Make sure the CPU sits flush before lowering the lever',
        ],
        tips: [
            'If building AMD, pins are on the CPU. If Intel, pins are in the socket',
            'The triangle mark indicates pin 1 position',
            'Hold the CPU by its edges only',
        ],
        query: 'how to install a CPU',
    },
    {
        label: 'Apply Thermal Paste',
        description: `Check if your cooler has pre-applied thermal paste (grey/white material on the contact plate). If not, apply a pea-sized dot (4-5mm diameter) of thermal paste directly in the center of the CPU. Do NOT spread it manually – the cooler's pressure will spread it evenly when installed.`,
        difficulty: 'Moderate',
        time: '2 minutes',
        warnings: [
            'Too much paste can spill over and damage components',
            'Too little paste creates hot spots',
            'Avoid getting paste on your fingers or motherboard',
        ],
        tips: [
            'The pea method works for most CPUs',
            'If reinstalling a cooler, clean off old paste with 90%+ isopropyl alcohol',
            'Quality paste can lower temperatures by 2-5°C',
        ],
        query: 'how to apply thermal paste to CPU',
    },
    {
        label: 'Install CPU Cooler',
        description: `Position the cooler above the CPU and align the mounting brackets with the holes around the socket. Lower it gently and evenly onto the CPU. For air coolers, secure the mounting screws in a diagonal/cross pattern (like tightening a car wheel). Connect the cooler's fan power cable to the CPU_FAN header on the motherboard.`,
        difficulty: 'Moderate',
        time: '10-15 minutes',
        warnings: [
            'Never power on without the cooler properly installed',
            'Ensure even mounting pressure on all corners',
            'Don\'t overtighten mounting screws',
        ],
        tips: [
            'Follow the specific instructions for your cooler model',
            'For water coolers, ensure the pump is connected to the CPU_PUMP header',
            'For air coolers, check RAM clearance before installation',
        ],
        query: 'how to install a cpu cooler',
    },
    {
        label: 'Install RAM',
        description: `Locate the DIMM slots on your motherboard (usually 2-4 long slots near the CPU). Open the retention clips on both ends of the slots you'll use. Align the notch in the RAM stick with the corresponding tab in the slot. Apply firm, even pressure straight down until both retention clips snap into place.`,
        difficulty: 'Easy',
        time: '5 minutes',
        warnings: [
            'RAM only fits in one orientation – don\'t force it',
            'Ensure both clips lock securely',
            'Install in the correct slots for dual-channel operation (check your manual)',
        ],
        tips: [
            'For 2 sticks in 4 slots, use slots 2 & 4 or follow motherboard manual',
            'RAM requires significant pressure to install – don\'t be afraid',
            'If possible, use RAM sticks from the same kit for best compatibility',
        ],
        query: 'how to install RAM',
    },
    {
        label: 'Install Storage (SSD/HDD)',
        description: `For M.2 SSDs: Locate the M.2 slot on your motherboard. Remove the screw at the end of the slot, insert the SSD at a 30-degree angle, then press down and secure with the screw.\n\nFor 2.5" SSDs/HDDs: Mount the drive in an appropriate bay in your case. Connect a SATA data cable from the drive to a SATA port on the motherboard. Connect a SATA power cable from your power supply to the drive.`,
        difficulty: 'Easy',
        time: '5-10 minutes',
        warnings: [
            'Handle HDDs carefully – they contain moving parts',
            'Some M.2 slots may disable certain SATA ports when used',
            'Use appropriate screws for mounting to prevent damage',
        ],
        tips: [
            'For fastest boot times, install your OS on an NVMe SSD if available',
            'Use the SATA ports numbered 0 or 1 for your boot drive',
            'Label SATA cables if you have multiple drives',
        ],
        query: 'how to install SSD or HDD',
    },
    {
        label: 'Mount Motherboard into Case',
        description: `First, install the I/O shield into the case (from inside, press until it clicks). Install brass standoffs into the case where the motherboard mounting holes align. Lower the motherboard at an angle to get the I/O ports through the shield first, then lay it flat onto the standoffs. Secure with screws, starting with the center screw first and then working outward in a star pattern.`,
        difficulty: 'Moderate',
        time: '15 minutes',
        warnings: [
            'Missing standoffs can short circuit your motherboard',
            'Extra standoffs in the wrong places can also cause shorts',
            'The I/O shield has sharp edges – be careful',
        ],
        tips: [
            'Count the mounting holes and match with installed standoffs',
            'Don\'t forget to install the I/O shield before the motherboard',
            'Set screws in place first before fully tightening any one screw',
        ],
        query: 'how to install motherboard in pc case',
    },
    {
        label: 'Install Power Supply (PSU)',
        description: `Locate the PSU mount (typically at the bottom of the case). Slide the PSU in with the fan facing down if there's ventilation, or up if there's not. Secure it with the provided screws. Keep most cables tucked away for now – you'll connect them as needed.`,
        difficulty: 'Easy',
        time: '10 minutes',
        warnings: [
            'Ensure PSU power switch is OFF during installation',
            'Use ALL the mounting screws provided',
            'Never open a PSU – internal capacitors can hold lethal charge',
        ],
        tips: [
            'Position the PSU so the fan has proper airflow (check case manual)',
            'If modular, only attach the cables you need',
            'A higher-rated 80+ certification means better efficiency',
        ],
        query: 'how to install power supply in pc',
    },
    {
        label: 'Connect Power Cables',
        description: `Connect the 24-pin motherboard cable to the large connector on the motherboard. Connect the 8-pin/4+4-pin CPU power cable to the CPU power connector (usually near the CPU). Route these cables behind the motherboard tray when possible. Leave GPU power cables for later when the GPU is installed.`,
        difficulty: 'Moderate',
        time: '15 minutes',
        warnings: [
            'Double-check each connection – a loose power cable means no boot',
            'Never force connectors – they\'re keyed to fit only one way',
            'Keep cables away from fans to prevent noise and damage',
        ],
        tips: [
            'The 24-pin connector has a clip that should click when seated properly',
            'Route cables through case grommets to keep them tidy',
            'Some motherboards have two CPU power connectors (4+4 and additional 4) – the additional one is only needed for extreme overclocking',
        ],
        query: 'how to connect power cables pc build',
    },
    {
        label: 'Install GPU',
        description: `Remove the appropriate PCIe slot covers from the back of your case. Align the GPU with the top PCIe x16 slot (usually the topmost full-length slot) and press down firmly and evenly until the retention clip clicks. Secure the GPU bracket to the case with screws. Connect any required PCIe power cables from the PSU to the GPU.`,
        difficulty: 'Easy',
        time: '5 minutes',
        warnings: [
            'Modern GPUs are heavy – support them when installing',
            'Make sure the PCIe slot latch is open before inserting',
            'Ensure the GPU\'s I/O bracket aligns with the case openings',
        ],
        tips: [
            'Always use the top PCIe slot for single GPU setups',
            'Large GPUs may need support brackets to prevent sagging',
            'Some GPUs need 1, 2, or even 3 power connectors – connect them all',
        ],
        query: 'how to install graphics card',
    },
    {
        label: 'Connect Front Panel and Finish Cabling',
        description: `Connect the small front panel connectors (power button, reset, LED indicators) to the pins at the bottom of the motherboard – consult your manual for exact locations. Connect any remaining fans to appropriate headers. Organize cables with zip ties for better airflow and appearance.`,
        difficulty: 'Challenging',
        time: '15 minutes',
        warnings: [
            'Front panel connectors are easily mixed up – refer to the manual',
            'Poor cable management can restrict airflow and raise temperatures',
            'Avoid blocking fan intakes with cables',
        ],
        tips: [
            'Most motherboards have a diagram printed on them near the front panel connectors',
            'Use twist ties temporarily until you\'re sure everything works',
            'Group similar cables together (e.g., all fan cables)',
        ],
        query: 'how to connect front panel pc',
    },
    {
        label: 'Double Check and Boot',
        description: `Before powering on, verify all connections: CPU power, motherboard power, GPU power, storage connections, and front panel connectors. Ensure no loose screws or tools are inside the case. Connect keyboard, mouse, and monitor to the appropriate ports. Flip the PSU switch to ON, then press the power button on the case.`,
        difficulty: 'Easy',
        time: '10 minutes',
        warnings: [
            'No display can indicate a loose component or power issue',
            'If nothing happens when pressing power, check front panel connections',
            'If fans spin but no display, check monitor connection and GPU seating',
        ],
        tips: [
            'Listen for a single beep or look for steady LED indicators – these are good signs',
            'The first boot may take longer than normal',
            'Enter BIOS by pressing Delete, F2, or F10 during startup (varies by motherboard)',
        ],
        query: 'how to boot pc for the first time after building',
    },
    {
        label: 'BIOS Setup and OS Installation',
        description: `Enter BIOS/UEFI and check that all components are detected. Enable XMP/DOCP for memory if available. Set boot priority to your installation media (USB or DVD). Save changes and restart. Follow OS installation prompts. Once installed, download and install motherboard and GPU drivers from the manufacturers' websites.`,
        difficulty: 'Moderate',
        time: '30-60 minutes',
        warnings: [
            'Don\'t skip driver installation – default Windows drivers are often suboptimal',
            'Create user accounts with strong passwords',
            'Update BIOS only if necessary and with stable power',
        ],
        tips: [
            'Windows 10/11 installation is mostly automated',
            'Download network drivers first if internet doesn\'t work after install',
            'Use Windows Update to get basic drivers, then install manufacturer ones',
        ],
        query: 'how to install windows on new pc build',
    },
    {
        label: 'Enjoy Your Build!',
        description: `Congratulations! You've successfully built your own PC. Install your favorite software, games, or productivity tools. Consider monitoring temperatures during heavy use with software like HWiNFO or MSI Afterburner to ensure everything is running properly. Enjoy the satisfaction of using a PC you built yourself!`,
        difficulty: 'Easy',
        time: 'Lifetime',
        tips: [
            'Keep your drivers updated but not obsessively – if things work well, don\'t fix what isn\'t broken',
            'Clean dust from your PC every 3-6 months',
            'Consider a backup solution for important files',
        ],
        query: 'what to do after building a pc',
        isFinal: true,
    },
];

export default function BuildGuidePage() {
    const [activeStep, setActiveStep] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Step refs for auto-scroll
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            const next = activeStep + 1;
            setActiveStep(next);

            // Scroll to next step after state update
            setTimeout(() => {
                const nextStepRef = stepRefs.current[next];
                if (nextStepRef) {
                    nextStepRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

            if (steps[next]?.isFinal) {
                toast.success('🎉 Build complete! Enjoy your new PC!', {
                    position: 'top-center',
                    autoClose: 5000,
                });

                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                });
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const getColorForDifficulty = (difficulty: StepType['difficulty']) => {
        switch(difficulty) {
            case 'Easy': return '#4caf50';
            case 'Moderate': return '#ff9800';
            case 'Challenging': return '#f44336';
            default: return '#2196f3';
        }
    };

    return (
        <Box height="100vh" display="flex" flexDirection="column" overflow="hidden">
            <ToastContainer />

            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                flexGrow={1}
                minHeight={0}
                sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#121212', height: '100%' }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', md: '60%' }, // 60% on desktop
                        height: { xs: '100%', md: '100%' }, 
                        bgcolor: '#1E1E1E',
                        color: 'white',
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: 3,
                        boxShadow: 3,
                        overflowY: 'auto',
                        mb: { xs: 2, md: 0 },
                        mr: { xs: 0, md: 2 },
                        minHeight: 0,
                        position: 'relative',
                    }}
                >


                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon /> PC Build Guide
                    </Typography>

                    {activeStep === 0 && (
                        <Paper elevation={3} sx={{p: 2, mb: 3, bgcolor: '#2a2a2a', color: 'white'}}>
                            <Typography variant="h6" gutterBottom>
                                Tools You'll Need:
                            </Typography>
                            <List dense>
                                {requiredTools.map((tool, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon sx={{minWidth: '36px'}}>
                                            <CheckCircleIcon fontSize="small" sx={{color: '#4caf50'}} />
                                        </ListItemIcon>
                                        <ListItemText primary={tool} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>
                                    <Typography sx={{ color: step.isFinal ? '#81c784' : 'white', fontWeight: 'bold' }}>
                                        {step.label}
                                    </Typography>
                                    {step.difficulty && step.time && (
                                        <Box sx={{display: 'flex', gap: 1, mt: 0.5}}>
                                            <Chip 
                                                size="small"
                                                label={`Difficulty: ${step.difficulty}`}
                                                sx={{
                                                    bgcolor: getColorForDifficulty(step.difficulty),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            <Chip 
                                                size="small"
                                                icon={<AccessTimeIcon sx={{fontSize: '0.9rem', color: 'white !important'}} />}
                                                label={step.time}
                                                sx={{bgcolor: '#2196f3', color: 'white', fontSize: '0.7rem'}}
                                            />
                                        </Box>
                                    )}
                                </StepLabel>
                                <StepContent>
                                    {/* Attach ref to each step's content */}
                                    <div ref={el => stepRefs.current[index] = el}>
                                        <Typography sx={{ color: 'white', mb: 2, whiteSpace: 'pre-line' }}>
                                            {step.description}
                                        </Typography>

                                        {step.warnings?.length > 0 && (
                                            <Box sx={{mt: 2, mb: 2}}>
                                                <Typography variant="subtitle2" sx={{display: 'flex', alignItems: 'center', color: '#f44336', mb: 1}}>
                                                    <WarningIcon sx={{mr: 1}} /> Common Mistakes to Avoid:
                                                </Typography>
                                                <Paper elevation={2} sx={{bgcolor: 'rgba(244, 67, 54, 0.1)', p: 1, borderLeft: '4px solid #f44336'}}>
                                                    <List dense>
                                                        {step.warnings.map((warning, idx) => (
                                                            <ListItem key={idx} sx={{py: 0}}>
                                                                <ListItemIcon sx={{minWidth: '36px'}}>
                                                                    <WarningIcon fontSize="small" sx={{color: '#f44336'}} />
                                                                </ListItemIcon>
                                                                <ListItemText primary={warning} sx={{color: '#f7f7f7'}} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Paper>
                                            </Box>
                                        )}

                                        {step.tips?.length > 0 && (
                                            <Box sx={{mt: 2, mb: 3}}>
                                                <Typography variant="subtitle2" sx={{display: 'flex', alignItems: 'center', color: '#ffab40', mb: 1}}>
                                                    <TipsAndUpdatesIcon sx={{mr: 1}} /> Pro Tips:
                                                </Typography>
                                                <Paper elevation={2} sx={{bgcolor: 'rgba(255, 171, 64, 0.1)', p: 1, borderLeft: '4px solid #ffab40'}}>
                                                    <List dense>
                                                        {step.tips.map((tip, idx) => (
                                                            <ListItem key={idx} sx={{py: 0}}>
                                                                <ListItemIcon sx={{minWidth: '36px'}}>
                                                                    <ThumbUpIcon fontSize="small" sx={{color: '#ffab40'}} />
                                                                </ListItemIcon>
                                                                <ListItemText primary={tip} sx={{color: '#f7f7f7'}} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Paper>
                                            </Box>
                                        )}

                                        <Divider sx={{mt: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)'}} />

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                            {!step.isFinal && (
                                                <Button 
                                                    variant="contained" 
                                                    onClick={handleNext} 
                                                    sx={{
                                                        bgcolor: '#4caf50',
                                                        '&:hover': { bgcolor: '#45a049' }
                                                    }}
                                                >
                                                    Complete Step
                                                </Button>
                                            )}
                                            {index > 0 && (
                                                <Button 
                                                    variant="contained" 
                                                    onClick={handleBack}
                                                    sx={{
                                                        bgcolor: '#616161',
                                                        '&:hover': { bgcolor: '#484848' }
                                                    }}
                                                >
                                                    Back
                                                </Button>
                                            )}
                                            <Button
                                                variant="contained"
                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.query)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                startIcon={<YouTubeIcon />}
                                                sx={{
                                                    bgcolor: '#e57373',
                                                    color: 'white',
                                                    '&:hover': { bgcolor: '#ef5350' },
                                                }}
                                            >
                                                Watch Tutorial
                                            </Button>
                                        </Box>
                                    </div>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>

                    {/* Show chat button on mobile */}
                    {isMobile && (
                        <IconButton
                            onClick={() => setChatOpen(true)}
                            sx={{
                                position: 'absolute',
                                bottom: 24,
                                right: 24,
                                bgcolor: '#2196f3',
                                color: 'white',
                                zIndex: 1301,
                                boxShadow: 3,
                                '&:hover': { bgcolor: '#1976d2' }
                            }}
                            size="large"
                            aria-label="Open chat"
                        >
                            <ChatIcon fontSize="large" />
                        </IconButton>
                    )}
                </Box>

                {/* Desktop: show chat inline */}
                {!isMobile && (
                    <Box
                        sx={{
                            width: {xs: '100%', md: '40%'},
                            height: {xs: 'calc(50vh - 70px)', md: '100%'},
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
                )}

                {/* Mobile: chat in drawer */}
                <Drawer
                    anchor="right"
                    open={chatOpen}
                    onClose={() => setChatOpen(false)}
                    PaperProps={{
                        sx: {
                            width: '100%',
                            maxWidth: 400,
                            bgcolor: 'white',
                            color: 'black',
                            p: 2,
                        }
                    }}
                    ModalProps={{
                        keepMounted: true,
                    }}
                >
                    <Box display="flex" flexDirection="column" height="100%">
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Chat Assistant</Typography>
                            <IconButton onClick={() => setChatOpen(false)}>
                                <span style={{fontSize: 24, fontWeight: 'bold'}}>×</span>
                            </IconButton>
                        </Box>
                        <Box flexGrow={1} minHeight={0}>
                            <Chatbot />
                        </Box>
                    </Box>
                </Drawer>
            </Box>
        </Box>
    );
}
