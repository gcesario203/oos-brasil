import Head from 'next/head'
import SideBar from '../components/SideBar'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { database } from '../firebase'
import { Organization } from '../types/Organization'
import OrganizationCard from '../components/OrganizationCard'
import Pagination from '../components/Pagination'
import SuggestOrganizationPopUp from '../components/SuggestOrganizationPopUp'
import SelectSearch, { SelectedOptionValue } from 'react-select-search'
import "react-select-search/style.css";

export default function Home() {
  const databaseRef = collection(database, 'organizations')

  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [organizationsName, setOrganizationsName] = useState<string[]>([])
  const [getOrganizations, setGetOrganizations] = useState<any[] | Organization[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filters, setFilter] = useState({
    city: '',
    state: '',
    type: '',
    organization: '',
  })

  // filters options
  const stateOptions = [{ name: "Todos", value: "" }, ...states.map(s => ({ name: s, value: s }))];
  const citiesOptions = [{ name: "Todos", value: "" }, ...cities.map(s => ({ name: s, value: s }))];
  const organizationOptions = [{ name: "Todos", value: "" }, ...organizationsName.map(s => ({ name: s, value: s }))];
  const typeOptions = [{ name: "Todos", value: "" }, ...types.map(s => ({ name: s, value: s }))];

  // pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [organizationsPerPage, setOrganizationsPerPage] = useState<number>(10)
  const lastOrganizationIndex = currentPage * organizationsPerPage;
  const firstOrganizationIndex = lastOrganizationIndex - organizationsPerPage;
  const currentOrganization = organizations.slice(firstOrganizationIndex, lastOrganizationIndex)

  // useEffects
  useEffect(() => {
    readDataFirebase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setOrganizations(getOrganizations)
  }, [getOrganizations])

  useEffect(() => {
    getStates()
    getCities()
    getTypes()
    getOrganizationsName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations])

  useEffect(() => {
    setCurrentPage(1)
    if (!getOrganizations) return
    let newOrganizationsArray: Organization[] = getOrganizations

    /// Caso todos os valores do filtro estejam vazios, já faz a busca imediatamente
    if (Object.values(filters).filter(filterValue => !!filterValue).length === 0)
      return setOrganizations(getOrganizations)

    Object.keys(filters).forEach(filterKey => {
      // Colocamos o valor que irá ser filtrado dentro desta variável
      const valueToBeFiltered = (filters as any)[filterKey];

      // Caso o filtro que está sendo iterado esteja vazio, não precisamos fazer nada
      if (!valueToBeFiltered) return;
      
      // Realiza efetivamente o filtro do componente
      newOrganizationsArray = newOrganizationsArray.filter(organization => (organization as any)[filterKey] === valueToBeFiltered);
    })

    setOrganizations(newOrganizationsArray)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  //get and readers
  const readDataFirebase = async () => {
    await getDocs(databaseRef)
      .then((response) => {
        setGetOrganizations(response.docs.map((organization) => {
          return { ...organization.data(), id: organization.id }
        }))
      })
  }

  const getStates = () => {
    let allStates: string[] = []

    if (filters.city === '' && filters.type === '' && filters.organization === '') {
      getOrganizations.map(organization => {
        if (allStates.find(state => state === organization.state)) return;
        return allStates = [...allStates, organization.state]
      })
    }

    organizations.map(organization => {
      if (allStates.find(state => state === organization.state)) return;
      return allStates = [...allStates, organization.state]
    })
    allStates.sort()
    setStates(allStates);
  }

  const getCities = () => {
    let allCities: string[] = []

    if (filters.state === '' && filters.type === '' && filters.organization === '') {
      getOrganizations.map(organization => {
        if (allCities.find(city => city === organization.city)) return;
        return allCities = [...allCities, organization.city]
      })
    }

    organizations.map(organization => {
      if (allCities.find(city => city === organization.city)) return;
      return allCities = [...allCities, organization.city]
    })

    allCities.sort()
    setCities(allCities);
  }

  const getTypes = () => {
    let allTypes: string[] = []

    if (filters.state === '' && filters.city === '' && filters.organization === '') {
      getOrganizations.map(organization => {
        if (allTypes.find(type => type === organization.type)) return;
        return allTypes = [...allTypes, organization.type]
      })
    }

    organizations.map(organization => {
      if (allTypes.find(type => type === organization.type)) return;
      return allTypes = [...allTypes, organization.type]
    })

    allTypes.sort()
    setTypes(allTypes)
  }

  const getOrganizationsName = () => {
    let allOrganizationsName: string[] = []

    if (filters.state === '' && filters.city === '' && filters.type === '') {
      getOrganizations.map(organization => {
        if (allOrganizationsName.find(organizationName => organizationName === organization.organization)) return;
        return allOrganizationsName = [...allOrganizationsName, organization.organization]
      })
    }

    organizations.map(organization => {
      if (allOrganizationsName.find(organizationName => organizationName === organization.organization)) return;
      return allOrganizationsName = [...allOrganizationsName, organization.organization]
    })

    allOrganizationsName.sort()
    setOrganizationsName(allOrganizationsName)
  }

  //handles
  const handleOnChange = (filter: string, selected: SelectedOptionValue | SelectedOptionValue[]) => {
    setFilter({ ...filters, [filter]: selected ? selected : "" });
  }



  return (
    <div>
      <Head>
        <title>OOS Brazil - Organizações</title>
        <meta name="description" content="Se organize em uma organização socialista perto de você" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className={styles.section}>
        <header className={styles.header}>
          <SideBar />
        </header>

        <main className={styles.main}>


          <div className={styles.mainDiv}>
            <p style={{ textAlign: 'center' }}>Procure e organize-se o mais próximo de você </p>
            <div className={styles.organizationsFilters}>
              <label>Filtrar por estado</label>
              <SelectSearch options={stateOptions} search={true} placeholder="Estado" onChange={s => handleOnChange("state", s)} value={filters.state} />
            </div>

            <div className={styles.organizationsFilters}>
              <label>Filtrar por cidade</label>
              <SelectSearch options={citiesOptions} search={true} placeholder="Cidade" onChange={s => handleOnChange("city", s)} value={filters.city} />
            </div>

            <div className={styles.organizationsFilters}>
              <label>Filtrar por organização</label>
              <SelectSearch options={organizationOptions} search={true} placeholder="Organização" onChange={s => handleOnChange("organization", s)} value={filters.organization} />
            </div>

            <div className={styles.organizationsFilters}>
              <label>Filtrar por tipo de organização</label>
              <SelectSearch options={typeOptions} search={true} placeholder="Tipe de organização" onChange={s => handleOnChange("type", s)} value={filters.type} />
            </div>
            <SuggestOrganizationPopUp />

          </div>
          <div className={styles.mainDiv}>
            {currentOrganization.map(organization => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}

            {getOrganizations.length <= 0 ? <p style={{ textAlign: 'center' }}>Carregando organizações...</p> : organizations.length <= 0 ? <p style={{ textAlign: 'center' }}>Infelizmente não temos nenhuma organização que caiba no seu critério, procure na maior cidade mais próxima de você :(</p> : <Pagination totalItems={organizations.length} itemsPerPage={organizationsPerPage} setCurrentPage={setCurrentPage} currentPage={currentPage} />}
          </div>
        </main>

      </section>
    </div>
  )
}
