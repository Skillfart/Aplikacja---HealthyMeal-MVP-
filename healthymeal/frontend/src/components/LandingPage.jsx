import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-primary-100/20">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="#" className="inline-flex space-x-6">
                <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                  Nowość
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>Dostępna wersja 1.0</span>
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Zdrowe posiłki dopasowane do Twoich potrzeb
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              HealthyMeal to innowacyjna aplikacja, która pomoże Ci przygotować zdrowe i smaczne posiłki,
              dostosowane do Twoich preferencji dietetycznych i ograniczeń żywieniowych.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary"
                >
                  Przejdź do aplikacji
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Rozpocznij za darmo
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    Zaloguj się <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Wszystko czego potrzebujesz</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Funkcje, które pokochasz
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            HealthyMeal to więcej niż tylko przepisy. To kompleksowe narzędzie do zarządzania Twoją dietą.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Personalizowane przepisy
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Dostosuj przepisy do swoich preferencji dietetycznych i alergii. Nasza sztuczna inteligencja
                  pomoże Ci znaleźć idealne zamienniki składników.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Wartości odżywcze
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Śledź wartości odżywcze swoich posiłków. Każdy przepis zawiera szczegółowe informacje
                  o kaloriach, makroskładnikach i mikroelementach.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                Asystent AI
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Wykorzystaj moc sztucznej inteligencji do modyfikacji przepisów. AI pomoże Ci dostosować
                  każdy przepis do Twoich potrzeb.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
  </div>
);
};

export default LandingPage;
