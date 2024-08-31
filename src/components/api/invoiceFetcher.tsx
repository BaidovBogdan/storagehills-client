import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/authContext';
import { useAtom } from 'jotai';
import { localAuth } from '../../atoms/localAuth';
import { BASE_URL } from '../../settings/global';

export default function InvoicesFetcher() {
  const { authTokens, logoutUser, user } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);
  const [isLocalAuth] = useAtom(localAuth);

  const calculateTotalSubscriptionDays = (
    freeSubscriptionExpiry: string | null,
    paidSubscriptionExpiry: string | null,
  ): number => {
    const today = new Date();
    let totalDays = 0;

    if (freeSubscriptionExpiry) {
      const freeExpiryDate = new Date(freeSubscriptionExpiry);
      console.log('Free expiry date:', freeExpiryDate);
      if (freeExpiryDate > today) {
        totalDays += Math.floor(
          (freeExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }

    if (paidSubscriptionExpiry) {
      const paidExpiryDate = new Date(paidSubscriptionExpiry);
      console.log('Paid expiry date:', paidExpiryDate);
      if (paidExpiryDate > today) {
        totalDays += Math.floor(
          (paidExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    }

    return totalDays;
  };

  const getProfile = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api_V1/subscription-profile/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authTokens?.access}`,
          },
        },
      );
      console.log('Profile data:', response.data);
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.response?.status);
      logoutUser();
    }
  };

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const totalDays = profile
    ? calculateTotalSubscriptionDays(
        profile.free_subscription_expiry,
        profile.paid_subscription_expiry,
      )
    : 0;

  return (
    <span>{isLocalAuth ? ` ${totalDays} дней` : 'Загрузка данных...'}</span>
  );
}
