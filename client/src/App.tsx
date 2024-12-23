import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

import {Cross} from './assets/cross.tsx'
import { Search } from './assets/search.tsx'
import { Sort } from './assets/sort.tsx'
import { Filter } from './assets/filter.tsx'

interface Business {
  busId: string
  name: string
  createdAt: string
  status: string
}
interface sortOptions {
  value: keyof Business
  order: number
}
interface searchOptions {
  value: keyof Business
  query: string
  isSearching: boolean
}
interface filterOptions {
  date: {
    from: string
    to: string
  }
  isActive: string
  isFiltering: boolean
}

const App: React.FC=()=> {

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [businessOriginal, setBusinessOriginal] = useState<Business[]>([]);
  const [business, setBusiness] = useState<Business[]>([]);
  const [name, setName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sort, setSort] = useState<sortOptions>({ value: 'createdAt', order: 1 });
  const [search, setSearch] = useState<searchOptions>({ value: 'name', query: '', isSearching: false });
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<filterOptions>({
    date: { from: '', to: '' },
    isActive: 'All',
    isFiltering: false,
  });
  const [currPage, setCurrPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);

  // const [id, setId] = useState<string>('');

  const fetchBuisiness = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/');
      console.log(response.data);
      const data = response.data.Items ;
      setBusiness(data);
      setBusinessOriginal(data);
    } catch (error) {
      console.error(error);
    }
  }

  const addBusiness = async () => {
    try {
      const response = await axios.post('http://localhost:9000/api/', {
        name,
        status
      });
      console.log(response.data);
      fetchBuisiness();
      setModalOpen(false);
      setName('');
      setStatus('');
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`http://localhost:9000/api/${id}`);
      console.log(response.data);
      fetchBuisiness();
    } catch (error) {
      console.error(error);
    }
  }
  const handleSort = (value: string) => () => {
    setSort({
      value: value as keyof Business,
      order: -sort.order,
    });
  }

  useEffect(() => {
    let filteredBusiness = [...businessOriginal];
  
    // Apply search 
    if (search.isSearching && search.query.trim() !== '') {
      filteredBusiness = filteredBusiness.filter((business) =>
        business[search.value].toLowerCase().includes(search.query.toLowerCase())
      );
    }
  
    // Apply active/inactive filter
    if (filter.isFiltering) {
      if (filter.isActive === 'active') {
        filteredBusiness = filteredBusiness.filter((business) => business.status === 'active');
      } else if (filter.isActive === 'inactive') {
        filteredBusiness = filteredBusiness.filter((business) => business.status === 'inactive');
      }
  
      // Apply date range filter
      if (filter.date.from && filter.date.to) {
        const fromDate = new Date(filter.date.from);
        const toDate = new Date(filter.date.to);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
  
        filteredBusiness = filteredBusiness.filter((business) => {
          const createdAt = new Date(business.createdAt).getTime();
          return createdAt >= fromDate.getTime() && createdAt <= toDate.getTime();
        });
      }
    }
  
    // Apply sorting
    const sortedBusiness = [...filteredBusiness].sort((a, b) => {
      const { value, order } = sort;
      if (a[value] > b[value]) return order;
      if (a[value] < b[value]) return -order;
      return 0;
    });
  
    setBusiness(sortedBusiness);
  }, [sort, search, filter, businessOriginal]);
    


  useEffect(() => {
    fetchBuisiness();
  },[])

  const handleClearFilter = () => {
    setFilter({
      date: { from: '', to: '' },
      isActive: 'All',
      isFiltering: false,
    });
    setBusiness(businessOriginal);
  }
  const handleApplyFilter = () => {
    setFilter({ ...filter, isFiltering: true });
    setFilterModalOpen(false);
  }

  const pages = Math.ceil(business.length / perPage);
  const currBusiness = business.slice((currPage - 1) * perPage, currPage * perPage);

  const handlePageChange = (page: number) => {
    setCurrPage(page);
  }
  const nextPage = () => {
    if (currPage < pages) {
      setCurrPage(currPage + 1);
    }
  }
  const prevPage = () => {
    if (currPage > 1) {
      setCurrPage(currPage - 1);
    }
  }

  return (
    <>
    <div className='bg-white h-[100vh]'>
      <div className='text-4xl font-semibold text-center pt-12'>
        Manage Business
      </div>

      <div>
        <div className='flex flex-row items-end justify-end gap-4 h-fit'>
          {filter.isFiltering ? 
          <div>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded-md mt-12 mr-2"
          onClick={handleClearFilter}
        >
          Clear Filters
        </button> </div>:null }
          <div>
          <button className='bg-purple-500 text-white px-4 py-2 rounded-md mr-16 mt-12' onClick={() =>setModalOpen(true)}>
            Create Business
          </button>
          </div>
        </div>
        <div>
            <table className='table-auto w-[95%] border-collapse border border-gray-500  mt-8 mx-8'>

              <thead>
                <tr>
                <th className='border-2 border-gray-500 px-4  text-center text-lg font-semibold'>
                  <div className='flex justify-center items-center'>               
                      {search.isSearching && search.value ==="createdAt"?(
                      <div>
                      <input type="text"
                        placeholder="Search"
                        className="border border-gray-300 px-2 py-1 rounded-md w-32"
                        value={search.query}
                        onChange={(e)=>setSearch({...search,query:e.target.value})} 
                      />
                        <button className='mx-2' onClick={()=>setSearch({value:"createdAt",query:'', isSearching:false})}>
                            < Cross/>
                        </button>
                      </div> ):(<><p>Created At</p>
                    <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center ml-8' onClick={()=>setSearch({value:"createdAt",query:'', isSearching:true})}>
                          <Search/>
                    </button>
                    </>
                    )}
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={handleSort("createdAt")}>
                          <Sort />
                      </button>
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={()=>setFilterModalOpen(true)}>
                        <Filter />
                      </button>
                   </div>
                </th>
                <th className='border-2 border-gray-500 px-4 py-2 text-center text-lg font-semibold'>
                  <div className='flex justify-center items-center'>                 
                      {search.isSearching && search.value ==="busId"?(
                      <div>
                      <input type="text"
                        placeholder="Search"
                        className="border border-gray-300 px-2 py-1 rounded-md w-32"
                        value={search.query}
                        onChange={(e)=>setSearch({...search,query:e.target.value})}
                      />
                        <button className='mx-2' onClick={()=>setSearch({value:"busId",query:'', isSearching:false})}>
                          <Cross />
                        </button>
                      </div> ):(<><p>ID</p>
                        <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center ml-8' onClick={()=>setSearch({value:"busId",query:'', isSearching:true})}>
                          <Search />
                        </button>
                        </>
                    )}

                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={handleSort("busId")}>
                        <Sort />
                      </button>
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={()=>setFilterModalOpen(true)}>
                        <Filter />
                      </button>
                  </div>
                </th>
                <th className='border-2 border-gray-500 px-4 py-2 text-center text-lg font-semibold'>
                  <div className='flex justify-center items-center'>
                      {search.isSearching && search.value ==="name"?(
                        <>
                        <input type="text"
                          placeholder="Search"
                          className="border border-gray-300 px-4 py-1 rounded-md w-32 "
                          value={search.query}
                          onChange={(e)=>setSearch({...search,query:e.target.value})}
                        />
                          <button className='mx-2' onClick={()=>setSearch({value:"name",query:'', isSearching:false})}>
                              <Cross />
                          </button>
                        </> ):(<> <p>Name</p>
                          <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center ml-12' onClick={()=>setSearch({value:"name",query:'', isSearching:true})}>
                            <Search />
                       </button>
                        </> )}
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={handleSort("name")}>
                        <Sort />
                      </button>
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={()=>setFilterModalOpen(true)}>
                        <Filter />
                      </button>
                  </div>
                </th>
                <th className='border-2 border-gray-500  py-2 text-center text-lg font-semibold'>Actions
                </th>
                <th className=' border-2 border-gray-500  py-2 text-center text-lg font-semibold'> 
                  <div className='flex justify-center items-center'>
                    {search.isSearching && search.value ==="status"?(
                      <>
                        <input type="text"
                          placeholder="Search"
                          className="border border-gray-300 px-2 py-1 rounded-md w-32 "
                          value={search.query}
                          onChange={(e)=>setSearch({...search,query:e.target.value})}
                        />
                        
                          <button className='mx-2' onClick={()=>setSearch({value:"status",query:'', isSearching:false})}>
                              <Cross />
                          </button>
                          </>
                        ):(<><p>Status</p> 
                          <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center ml-12' onClick={()=>setSearch({value:"status",query:'', isSearching:true})}>
                            <Search />
                          </button>
                        </>
                      )}
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center'  onClick={handleSort("status")}>
                        <Sort />
                      </button>
                      <button className='hover:shadow-lg rounded-full hover:bg-gray-200 p-1.5 hover:duration-150 flex justify-center items-center' onClick={()=>setFilterModalOpen(true)}>
                        <Filter />
                      </button>
                  </div>
                </th>
                </tr>
              </thead>

              <tbody>
                {currBusiness.map((business) => (
                  <tr key={business.busId}>
                    <td className='border border-gray-500 px-4 py-2 text-center text-lg'>{new Date(business.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className='border border-gray-500 px-4 py-2 text-center text-lg'>{business.busId}</td>
                    <td className='border border-gray-500 px-4 py-2 text-center text-lg'>{business.name}</td>
                    <td className='border border-gray-500 px-4 py-2 text-center text-lg'>
                      <button className='bg-red-500 text-white px-4 py-1.5 rounded-md my-2' onClick={() => handleDelete(business.busId)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 5a1 1 0 1 1 0 2h-1l-.003.071l-.933 13.071A2 2 0 0 1 16.069 22H7.93a2 2 0 0 1-1.995-1.858l-.933-13.07L5 7H4a1 1 0 0 1 0-2zm-3.003 2H7.003l.928 13h8.138zM14 2a1 1 0 1 1 0 2h-4a1 1 0 0 1 0-2z"/></g></svg>

                      </button>
                    </td>
                    <td className='border border-gray-500 px-4 py-2 text-center text-lg'>{business.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='mt-12'> 
                    {perPage < business.length ? (
                    <div className='flex justify-center items-center gap-3 mt-4'>
                      <button className='border border-gray-900 rounded-md w-16 h-10 hover:shadow-lg hover:duration-150' onClick={prevPage}>Prev</button>
                      {Array.from({ length: pages }, (_, i) => (
                        <button
                          key={i}
                          className={`border border-gray-900 rounded-md w-10 h-10 hover:shadow-lg hover:duration-150 ${currPage === i + 1 ? 'bg-gray-500 text-white' : ''}`}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button className='border border-gray-900 rounded-md w-16 h-10 hover:shadow-lg hover:duration-150' onClick={nextPage}>Next</button>
                    </div>
                    ) : null}
                    
                    <div className='flex justify-end items-center mr-16'>
                      Items per page
                      <select
                        className='border border-gray-500 bg-transparent rounded-md p-2 ml-4 '
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
              </div>
        </div>
      </div>

            {/* Modal for Creating Chatroom */}
            {modalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Business</h2>
            <input
              type="text"
              placeholder="Business Name"
              className="border border-gray-300 px-4 py-2 rounded w-full mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input type="text" 
            placeholder='Status'
            className="border border-gray-300 px-4 py-2 rounded w-full mb-4"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded"
                onClick={addBusiness}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Filters */}
{filterModalOpen && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      <div>
        <h1 className='text-md font-semibold'>Date</h1>
        {/* Date Filters */}
        <label className='block p-2 w-fit h-fit'>
          From:
          <input
          className='rounded mx-4 border border-gray-300 p-1'
            type="date"
            value={filter.date.from}
            onChange={(e) => [setFilter({ ...filter, date: { ...filter.date, from: e.target.value } }), console.log(e.target.value)]}
          />
        </label>
        <label className='block ml-4 p-2 w-fit h-fit'>
          To:
          <input
          className='rounded mx-4 border border-gray-300 p-1'
            type="date"
            value={filter.date.to}
            onChange={(e) => setFilter({ ...filter, date: { ...filter.date, to: e.target.value } })}
          />
        </label>
      </div>
      <div>
        {/* Active Status Filter */}
        <h1 className='text-md font-semibold mt-4  '> Status </h1>
        <label className='block mb-6 p-2 w-fit h-fit'>

          <select className='rounded mx-4 p-1 ml-10'
            value={filter.isActive}
            onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
          >
            <option value="All">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => setFilterModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
          onClick={handleApplyFilter}
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}


    </div>
    </>
  )
}

export default App
