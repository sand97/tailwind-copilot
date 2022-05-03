// @flow
import * as React from 'react';
import '../ui.css'
import {useEffect, useRef, useState} from "react";
import {TailwindConfig} from "tailwindcss/tailwind-config";
import {figmaRGBToHex,} from "@figma-plugin/helpers";


type Props = {

};


const isJsFileName = (name?: string) => {
    return ['js',]
        .includes((name || '').split('.').slice(-1)[0]?.toLowerCase())
}


export const WelcomePage = (props: Props) => {

    const ref = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState<number[] | undefined>();
    const refTailwindModule = useRef<any>(null);

    const startAnalyseNodes = (config: TailwindConfig) => {
        setLoading([0, 0]);
        parent.postMessage({ pluginMessage: {type: 'analyse-design', config } }, '*');
    }



    useEffect(() => {
        window.onmessage = (msg) => {
            const data = msg.data.pluginMessage;
            const {type} = data;
            if (type === 'analyse-design-response') {
                setLoading(undefined);
            }
        };
    }, []);


    const handleFileSelect = (file: File) =>{
        const  reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            const result = evt.target.result
            try {
                let module: { exports?: TailwindConfig } = {exports: undefined}
                eval(result as string);
                refTailwindModule.current = module.exports;
                startAnalyseNodes(module.exports);
            } catch (e) {
                setError('Error during parse your config file. Please check your config file and try again');
            }
        }
        reader.onerror = function (evt) {
            setError('Error during reading your config file. Please try again');
        }
    }

    return (
        <div className={'welcome_page bg-paper px-4 flex flex-col justify-center items-center'}>
            <img src={require('../assets/logo.svg')} className={'logo mb-4'} />
            <h1 className={'h1 text-white mb-2 text-center'}>
                Welcome on Tailwind Copilot
            </h1>
            <p className={'h6 text-grey text-center mb-10'}>
                To get-started, import your configuration file
                <span className={'text-green'}> tailwind.config.js </span>
                or create new configuration automatically based on this design.
            </p>
            <input
                onChange={e => {
                    if (e.target.files.length > 0) {
                        const file = e.target.files[0];
                        if (!isJsFileName(file.name)) {
                            setError('Please select a .js fille')
                        }else{
                            handleFileSelect(file);
                        }
                    }
                }}
                className={'hidden'} type="file" ref={ref}/>
            <button
                onClick={() => ref.current.click()}
                className={'button button-primary min-w-sm mb-4'}>
                {loading ? `${loading[0]}/${loading[1]}` : "Import configuration file"}
            </button>
            <button className={'button button-secondary min-w-sm mb-4'}>
                {loading ? `${loading[0]}/${loading[1]}` : "Create new configuration"}
            </button>

            {error &&  <div className={'error min-w-sm'}>
                <p className={'body1 content text-white'}>
                    <p className="text">
                        {error}
                    </p>
                    <img onClick={() => setError(undefined)} src={require('../assets/x-circle.svg')}  />
                </p>
            </div>}
        </div>
    );
};