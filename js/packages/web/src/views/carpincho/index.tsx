import React, { useEffect, useState } from 'react';
import { Col, Layout } from 'antd';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom';
import { ArtistCard } from '../../components/ArtistCard';
import { useMeta } from '../../contexts';
import { useCreatorArts, useUserArts } from '../../hooks';
import { useWallet } from '@solana/wallet-adapter-react';
import { Container } from './ObjLoader'

const { Content } = Layout;

export enum ArtworkViewState {
    Metaplex = '0',
    Owned = '1',
    Created = '2',
  }

  
export const CarpinchoView = () => {
    const { connected, publicKey } = useWallet();
    const { metadata, isLoading } = useMeta();
    const ownedMetadata = useUserArts();
    const [activeKey, setActiveKey] = useState(ArtworkViewState.Metaplex);
    const createdMetadata = useCreatorArts(publicKey?.toBase58() || '');
    const [clickedButton, setClickedButton] = useState('');
    const [selectedNFT, setSelectedNFT] = useState('https://v4l2bno44i6hbh4yavekunih2afq2zz45d5fp7fnfiolunad6fdq.arweave.net/rxegtdziPHCfmAVIqjUH0AsNZzzo-lf8rSocujQD8Uc/');

    const items =
    activeKey === ArtworkViewState.Owned
      ? ownedMetadata.map(m => m.metadata)
      : activeKey === ArtworkViewState.Created
      ? createdMetadata
      : metadata;

      const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>, url:string) => {
        event.preventDefault();
        console.log("Button URL " + url);
        const button: HTMLButtonElement = event.currentTarget;
        setClickedButton(button.name);
        fetch(url)
        .then(response => response.json())
        .then(data => 
            {
                console.log(data);
                if (data.properties.files.length >= 2)
                {
                    console.log(data.properties.files[1].uri);
                    fetch(url)
                    .then(response2 => 
                        {                            
                            if (response2.redirected)
                            {
                                //console.log(response2.url);
                                fetch(response2.url)
                                .then(response3 => response3.json())
                                .then(data3 =>
                                {                                    
                                    setSelectedNFT(data3.properties.files[1].uri);
                                }
                                );                                
                            }                            
                        });
                }
            }
        );
      };

    return (
        <div>            
            {!isLoading
                ? items.map((m, idx) => {
                    const id = m.pubkey;                    
                    return (
                        <div>
                            <h3>{m.info.data.name}</h3>
                            <a className="ant-btn ant-btn-primary connector" href={`/art/${id}`}>Show NFT in market</a>                            
                            <button className="ant-btn ant-btn-primary connector" onClick={ (e)=> buttonHandler(e,m.info.data.uri) } 
                            >
                                 Render to Game!
                            </button>                            
                        </div>
                    );
                })
                : [...Array(10)].map((_, idx) => <div>Loading...</div>)}

                <br/>
                <Container nftUrl={selectedNFT}></Container>
        </div>
    );
}