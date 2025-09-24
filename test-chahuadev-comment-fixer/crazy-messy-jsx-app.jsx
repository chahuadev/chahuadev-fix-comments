import React, { useState, useEffect } from 'react';

function CrazyCounter({ initialValue = 0, step = 1 }) {
    const [count, setCount] = useState(initialValue);
    const [history, setHistory] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setCount(prev => {
                    const newCount = prev + step;
                    setHistory(h => [...h.slice(-9), newCount]);
                    return newCount;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isRunning, step]);

    const handleReset = () => {
        setCount(initialValue);
        setHistory([]);
        setIsRunning(false);
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
            <h3>Counter: {count}</h3>
            <button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? 'Stop' : 'Start'}
            </button>
            <button onClick={() => setCount(c => c + step)}>+{step}</button>
            <button onClick={() => setCount(c => c - step)}>-{step}</button>
            <button onClick={handleReset}>Reset</button>
            <div>History: {history.join(', ')}</div>
        </div>
    );
}

class WeirdComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            filter: '',
            sortBy: 'name'
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        this.setState({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData = [
                { id: 1, name: 'Alpha', value: Math.random() * 100, category: 'A' },
                { id: 2, name: 'Beta', value: Math.random() * 100, category: 'B' },
                { id: 3, name: 'Gamma', value: Math.random() * 100, category: 'A' },
                { id: 4, name: 'Delta', value: Math.random() * 100, category: 'C' }
            ];
            this.setState({ data: mockData });
        } finally {
            this.setState({ loading: false });
        }
    }

    handleFilterChange = (event) => {
        this.setState({ filter: event.target.value });
    };

    handleSortChange = (event) => {
        this.setState({ sortBy: event.target.value });
    };

    getFilteredData() {
        const { data, filter, sortBy } = this.state;
        let filtered = filter ? data.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            item.category.toLowerCase().includes(filter.toLowerCase())
        ) : data;

        return filtered.sort((a, b) => {
            if (sortBy === 'value') {
                return b.value - a.value;
            }
            return a[sortBy].localeCompare(b[sortBy]);
        });
    }

    render() {
        const { loading, filter, sortBy } = this.state;
        const filteredData = this.getFilteredData();

        return (
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                <h2>Weird Data Manager</h2>
                <div style={{ marginBottom: '20px' }}>
                    <input type="text" placeholder="Filter..." value={filter} onChange={this.handleFilterChange} style={{ marginRight: '10px' }} />
                    <select value={sortBy} onChange={this.handleSortChange}>
                        <option value="name">Sort by Name</option>
                        <option value="value">Sort by Value</option>
                        <option value="category">Sort by Category</option>
                    </select>
                    <button onClick={() => this.loadData()}>Reload</button>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <ul>
                        {filteredData.map(item => (
                            <li key={item.id} style={{ margin: '5px 0', padding: '10px', backgroundColor: 'white' }}>
                                <strong>{item.name}</strong> - {item.value.toFixed(2)} ({item.category})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}

function FormMess() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', rating: 5 });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.includes('@')) newErrors.email = 'Invalid email';
        if (formData.message.length < 10) newErrors.message = 'Message too short';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setSubmitted(true);
            console.log('Form submitted:', formData);
            setTimeout(() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', message: '', rating: 5 });
            }, 2000);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px' }}>
            <h3>Messy Form</h3>
            <div>
                <input type="text" placeholder="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} style={{ width: '100%', margin: '5px 0' }} />
                {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
            </div>
            <div>
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} style={{ width: '100%', margin: '5px 0' }} />
                {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
            </div>
            <div>
                <textarea placeholder="Message" value={formData.message} onChange={(e) => handleChange('message', e.target.value)} style={{ width: '100%', margin: '5px 0', height: '60px' }} />
                {errors.message && <small style={{ color: 'red' }}>{errors.message}</small>}
            </div>
            <div>
                <label>Rating: {formData.rating}</label>
                <input type="range" min="1" max="10" value={formData.rating} onChange={(e) => handleChange('rating', parseInt(e.target.value))} style={{ width: '100%', margin: '5px 0' }} />
            </div>
            <button type="submit" disabled={submitted}>
                {submitted ? 'Submitted!' : 'Submit'}
            </button>
        </form>
    );
}

const App = () => {
    const [activeTab, setActiveTab] = useState('counter');
    const [theme, setTheme] = useState('light');

    const tabs = [
        { id: 'counter', label: 'Counter', component: <CrazyCounter initialValue={10} step={2} /> },
        { id: 'data', label: 'Data Manager', component: <WeirdComponent /> },
        { id: 'form', label: 'Form', component: <FormMess /> }
    ];

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000', minHeight: '100vh' }}>
            <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
                <h1>Crazy JSX Test App</h1>
                <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
                    Toggle Theme ({theme})
                </button>
            </header>
            <nav style={{ padding: '10px' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ margin: '0 5px', padding: '10px', backgroundColor: activeTab === tab.id ? '#007bff' : '#f8f9fa', color: activeTab === tab.id ? 'white' : 'black', border: '1px solid #ccc' }}>
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main style={{ padding: '20px' }}>
                {tabs.find(tab => tab.id === activeTab)?.component}
            </main>
        </div>
    );
};

export default App;
export { CrazyCounter, WeirdComponent, FormMess };