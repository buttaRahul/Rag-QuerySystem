import { useState } from 'react';
import './App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Raleway', 'Arial', 'Roboto', '-apple-system', 'BlinkMacSystemFont',
      '"Segoe UI"', '"Helvetica Neue"', 'sans-serif', '"Apple Color Emoji"',
      '"Segoe UI Emoji"', '"Segoe UI Symbol"',
    ].join(','),
  },
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#d32f2f' },
    background: { default: '#f4f6f8' },
    text: { primary: '#333', secondary: '#555' },
  },
});

function App() {
  const [urlCount, setUrlCount] = useState(1);
  const [urls, setUrls] = useState(['']);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const addUrlField = () => {
    setUrlCount((prevCount) => prevCount + 1);
    setUrls((prevUrls) => [...prevUrls, '']);
  };

  const removeUrlField = (index) => {
    setUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    setUrlCount((prevCount) => prevCount - 1);
  };

  const handleUrlChange = (index, value) => {
    setUrls((prevUrls) => {
      const updatedUrls = [...prevUrls];
      updatedUrls[index] = value;
      return updatedUrls;
    });
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const submitUrls = async () => {
    const dataToSend = { question, urls };
    setLoading(true); 
    setResponse(null); 

    try {
      const response = await fetch('http://127.0.0.1:8000/submit-urls/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error('Error submitting URLs and question:', error);
      setResponse({ error: 'Failed to fetch response. Please try again.' });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App" sx={{ display: 'flex', height: '100vh', backgroundColor: theme.palette.background.default }}>

        {/* Sidebar */}
        <Box sx={{ width: '300px', minWidth: '300px', padding: '16px', borderRight: '2px solid #ddd', height: '100%', backgroundColor: '#333333' }}>
          <Typography variant="h4" sx={{ marginBottom: '16px', fontWeight: 'bold', textAlign: 'center',color:'white' }}>
            Enter URLs
          </Typography>

          {urls.map((url, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <TextField
                id={`outlined-basic-${i}`}
                label={`URL-${i + 1}`}
                variant="outlined"
                // color='white'
                InputProps={{
                  style: { color: 'white' }, 
                }}
                InputLabelProps={{
                  style: { color: 'white' }, 
                }}
                value={url || ''}
                onChange={(e) => handleUrlChange(i, e.target.value)}
                sx={{ flexGrow: 1, marginRight: '8px' }}
              />
              <Button variant="contained" color="secondary" onClick={() => removeUrlField(i)} sx={{ minWidth: '40px', height: '40px', padding: '0' }}>
                <DeleteIcon />
              </Button>
            </Box>
          ))}

          <Button variant="contained" color="primary" onClick={addUrlField} fullWidth>
            Add URL
          </Button>
        </Box>

       
        <Box sx={{ flexGrow: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 ,backgroundColor:'#f9fbe4'}}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Enter Question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={handleQuestionChange}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" color="primary" onClick={submitUrls} sx={{ height: '56px' }}>
              Submit
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Results */}
            <Paper sx={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f4f4f4' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Results:</Typography>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={60} animation="wave" />
              ) : response ? (
                response.error ? (
                  <Typography sx={{ color: 'red' }}>{response.error}</Typography>
                ) : (
                  <Typography>{response.llm_response?.answer}</Typography>
                )
              ) : (
                <Typography>Submit a question and URLs to see results.</Typography>
              )}
            </Paper>

            {/* Sources */}
            <Paper sx={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f4f4f4' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Sources:</Typography>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={60} animation="wave" />
              ) : response && response.llm_response && response.llm_response.sources ? (
                Array.isArray(response.llm_response.sources) ? (
                  response.llm_response.sources.map((source, index) => (
                    <Typography key={index}>
                      <a href={source} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                        {source}
                      </a>
                    </Typography>
                  ))
                ) : (
                  <Typography>
                    <a href={response.llm_response.sources} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                      {response.llm_response.sources}
                    </a>
                  </Typography>
                )
              ) : (
                <Typography>No sources available.</Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
