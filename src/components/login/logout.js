import { useNavigate } from 'react-router-dom';

const Logout = () =>{
    const navigate = useNavigate();

  useEffect(() => {
    console.log('Logging out...');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.clear(); 
    navigate('/login');
  }, [navigate]);
}
export default Logout;